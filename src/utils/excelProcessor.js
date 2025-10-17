import * as XLSX from 'xlsx';

// Função de debug para mostrar mapeamento de colunas
const debugColumnMapping = (sheetName, headers, columnMap, sampleRow) => {
  console.log(`=== DEBUG SHEET: ${sheetName} ===`);
  console.log('Headers encontrados:', headers);
  console.log('Mapeamento de colunas:', columnMap);
  if (sampleRow) {
    console.log('Exemplo de dados da primeira linha:');
    Object.keys(columnMap).forEach(key => {
      const colIndex = columnMap[key];
      console.log(`  ${key}: coluna ${colIndex} = "${sampleRow[colIndex]}"`);
    });
  }
  console.log('================================');
};

export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const products = [];
        let productNumber = 3; // Começar do 003
        
        // Processar cada aba
        workbook.SheetNames.forEach(sheetName => {
          console.log(`\n🔍 Processando aba: ${sheetName}`);
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Encontrar linha de cabeçalho
          let headerRow = -1;
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.some(cell => 
              cell && typeof cell === 'string' && 
              (cell.toLowerCase().includes('description') || 
               cell.toLowerCase().includes('item') ||
               cell.toLowerCase().includes('produto') ||
               cell.toLowerCase().includes('units') ||
               cell.toLowerCase().includes('unités'))
            )) {
              headerRow = i;
              break;
            }
          }
          
          if (headerRow === -1) {
            console.log(`❌ Cabeçalho não encontrado na aba ${sheetName}`);
            return;
          }
          
          console.log(`✅ Cabeçalho encontrado na linha ${headerRow + 1}`);
          
          const headers = jsonData[headerRow];
          const dataRows = jsonData.slice(headerRow + 1);
          
          // Mapear colunas com lógica corrigida
          const columnMap = {};
          headers.forEach((header, index) => {
            if (!header) return;
            const headerStr = header.toString().toLowerCase().trim();
            
            // Description - priorizar "Item Description" ou similar
            if ((headerStr.includes('item') && headerStr.includes('description')) || 
                headerStr === 'description' ||
                headerStr.includes('produto')) {
              columnMap.description = index;
            } 
            // Barcode
            else if (headerStr.includes('barcode') || 
                     headerStr.includes('upc') || 
                     headerStr.includes('gtin')) {
              columnMap.barcode = index;
            } 
            // Units per case - CORRIGIDO: aceitar "Unités - Units" ou "Units/Case"
            else if ((headerStr.includes('unités') || headerStr.includes('units')) && 
                     !headerStr.includes('sales') && 
                     !headerStr.includes('forecast')) {
              if (!columnMap.unitsPerCase) { // Pegar a primeira ocorrência
                columnMap.unitsPerCase = index;
              }
            } 
            // Unit Cost
            else if (headerStr.includes('cost') && 
                     headerStr.includes('unit') && 
                     !headerStr.includes('case')) {
              columnMap.unitCost = index;
            } 
            // Case Cost
            else if (headerStr.includes('cost') && headerStr.includes('case')) {
              columnMap.caseCost = index;
            } 
            // Retail Price - CORRIGIDO: usar "Average market retail" ao invés de "Forecast Sales"
            else if ((headerStr.includes('average') && headerStr.includes('retail')) ||
                     (headerStr.includes('retail') && headerStr.includes('price')) ||
                     (headerStr.includes('market') && headerStr.includes('retail'))) {
              columnMap.retailPrice = index;
            }
            // Se não encontrou retail price específico, aceitar apenas "retail" ou "price" (mas não "sales")
            else if (!columnMap.retailPrice && 
                     (headerStr === 'retail' || headerStr === 'price') && 
                     !headerStr.includes('sales') && 
                     !headerStr.includes('forecast')) {
              columnMap.retailPrice = index;
            }
            // Unit Profit
            else if (headerStr.includes('profit') && headerStr.includes('unit')) {
              columnMap.unitProfit = index;
            } 
            // Margin - pode estar como decimal ou percentual
            else if (headerStr.includes('margin') || headerStr.includes('marge')) {
              columnMap.margin = index;
            }
          });
          
          // Debug do mapeamento
          const sampleRow = dataRows.length > 0 ? dataRows[0] : null;
          debugColumnMapping(sheetName, headers, columnMap, sampleRow);
          
          // Processar dados
          let processedCount = 0;
          dataRows.forEach((row, rowIndex) => {
            if (!row || row.length === 0) return;
            
            const description = row[columnMap.description];
            if (!description || description.toString().trim() === '') return;
            
            // Parse dos valores com validação
            const unitCost = parseFloat(row[columnMap.unitCost]) || 0;
            const retailPrice = parseFloat(row[columnMap.retailPrice]) || 0;
            const unitsPerCase = parseInt(row[columnMap.unitsPerCase]) || 1;
            
            // Debug dos primeiros 3 produtos
            if (processedCount < 3) {
              console.log(`\n📊 Produto ${processedCount + 1} (linha ${rowIndex + headerRow + 2}):`);
              console.log(`  Nome: "${description}"`);
              console.log(`  Units per Case: "${row[columnMap.unitsPerCase]}" → ${unitsPerCase}`);
              console.log(`  Unit Cost: "${row[columnMap.unitCost]}" → $${unitCost.toFixed(2)}`);
              console.log(`  Retail Price: "${row[columnMap.retailPrice]}" → $${retailPrice.toFixed(2)}`);
            }
            
            // Calcular valores ausentes
            const caseCost = row[columnMap.caseCost] ? 
              parseFloat(row[columnMap.caseCost]) : 
              unitCost * unitsPerCase;
              
            const unitProfit = row[columnMap.unitProfit] ? 
              parseFloat(row[columnMap.unitProfit]) : 
              retailPrice - unitCost;
            
            // Calcular margem - CORRIGIDO: verificar se já está em percentual ou decimal
            let margin = 0;
            if (columnMap.margin !== undefined && row[columnMap.margin]) {
              const marginValue = parseFloat(row[columnMap.margin]);
              // Se o valor é menor que 1, provavelmente está em formato decimal (0.27 = 27%)
              if (marginValue < 1) {
                margin = Math.round(marginValue * 100);
              } else {
                margin = Math.round(marginValue);
              }
            } else if (unitCost > 0) {
              // Calcular margem: (Preço - Custo) / Custo * 100
              margin = Math.round((unitProfit / unitCost) * 100);
            }
            
            // Debug dos cálculos dos primeiros 3 produtos
            if (processedCount < 3) {
              console.log(`  Case Cost: $${caseCost.toFixed(2)}`);
              console.log(`  Unit Profit: $${unitProfit.toFixed(2)}`);
              console.log(`  Margin: ${margin}%`);
            }
            
            products.push({
              number: String(productNumber).padStart(3, '0'),
              name: description.toString().trim(),
              description: description.toString().trim(),
              barcode: row[columnMap.barcode] ? row[columnMap.barcode].toString() : '',
              category: sheetName,
              unitsPerCase: unitsPerCase,
              unitCost: unitCost.toFixed(2),
              caseCost: caseCost.toFixed(2),
              retailPrice: retailPrice.toFixed(2),
              unitProfit: unitProfit.toFixed(2),
              margin: margin,
              fileName: `${String(productNumber).padStart(3, '0')}_${description.toString().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}.html`
            });
            
            productNumber++;
            processedCount++;
          });
          
          console.log(`✅ ${processedCount} produtos processados na aba ${sheetName}`);
        });
        
        console.log(`\n🎉 TOTAL: ${products.length} produtos processados`);
        
        resolve({
          success: true,
          products: products,
          totalProducts: products.length,
          categories: [...new Set(products.map(p => p.category))]
        });
        
      } catch (error) {
        console.error('❌ Erro no processamento:', error);
        reject({
          success: false,
          error: error.message
        });
      }
    };
    
    reader.onerror = () => {
      reject({
        success: false,
        error: 'Erro ao ler arquivo'
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};
