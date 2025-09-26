import * as XLSX from 'xlsx';

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
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Encontrar linha de cabeçalho
          let headerRow = -1;
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.some(cell => 
              cell && typeof cell === 'string' && 
              (cell.toLowerCase().includes('description') || 
               cell.toLowerCase().includes('item') ||
               cell.toLowerCase().includes('produto'))
            )) {
              headerRow = i;
              break;
            }
          }
          
          if (headerRow === -1) return;
          
          const headers = jsonData[headerRow];
          const dataRows = jsonData.slice(headerRow + 1);
          
          // Mapear colunas
          const columnMap = {};
          headers.forEach((header, index) => {
            if (!header) return;
            const headerStr = header.toString().toLowerCase();
            
            if (headerStr.includes('description') || headerStr.includes('item')) {
              columnMap.description = index;
            } else if (headerStr.includes('barcode') || headerStr.includes('upc') || headerStr.includes('gtin')) {
              columnMap.barcode = index;
            } else if (headerStr.includes('units') && headerStr.includes('case')) {
              columnMap.unitsPerCase = index;
            } else if (headerStr.includes('cost') && headerStr.includes('unit') && !headerStr.includes('case')) {
              columnMap.unitCost = index;
            } else if (headerStr.includes('cost') && headerStr.includes('case')) {
              columnMap.caseCost = index;
            } else if (headerStr.includes('retail') || headerStr.includes('price')) {
              columnMap.retailPrice = index;
            } else if (headerStr.includes('profit') && headerStr.includes('unit')) {
              columnMap.unitProfit = index;
            } else if (headerStr.includes('margin') || headerStr.includes('marge')) {
              columnMap.margin = index;
            }
          });
          
          // Processar dados
          dataRows.forEach(row => {
            if (!row || row.length === 0) return;
            
            const description = row[columnMap.description];
            if (!description || description.toString().trim() === '') return;
            
            const unitCost = parseFloat(row[columnMap.unitCost]) || 0;
            const retailPrice = parseFloat(row[columnMap.retailPrice]) || 0;
            const unitsPerCase = parseInt(row[columnMap.unitsPerCase]) || 1;
            
            // Calcular valores ausentes
            const caseCost = row[columnMap.caseCost] ? 
              parseFloat(row[columnMap.caseCost]) : 
              unitCost * unitsPerCase;
              
            const unitProfit = row[columnMap.unitProfit] ? 
              parseFloat(row[columnMap.unitProfit]) : 
              retailPrice - unitCost;
              
            const margin = unitCost > 0 ? 
              Math.round((unitProfit / unitCost) * 100) : 0;
            
            products.push({
              number: String(productNumber).padStart(3, '0'),
              name: description.toString().trim(),
              description: description.toString().trim(),
              barcode: row[columnMap.barcode] ? row[columnMap.barcode].toString() : '',
              category: sheetName,
              unitsPerCase: unitsPerCase,
              unitCost: unitCost,
              caseCost: caseCost,
              retailPrice: retailPrice,
              unitProfit: unitProfit,
              margin: margin,
              fileName: `${String(productNumber).padStart(3, '0')}_${description.toString().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}.html`
            });
            
            productNumber++;
          });
        });
        
        resolve({
          success: true,
          products: products,
          totalProducts: products.length,
          categories: [...new Set(products.map(p => p.category))]
        });
        
      } catch (error) {
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
