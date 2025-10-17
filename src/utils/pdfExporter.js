import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta o catálogo completo para PDF
 * @param {Array} products - Array de produtos
 * @param {string} catalogName - Nome do catálogo
 * @param {Function} onProgress - Callback de progresso (current, total)
 * @returns {Promise<void>}
 */
export const exportCatalogToPDF = async (products, catalogName = 'Catalogo', onProgress = null) => {
  try {
    // Criar PDF em formato Letter (8.5" x 11")
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Página de capa
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Catálogo de Produtos', pageWidth / 2, 60, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(catalogName, pageWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Total de produtos: ${products.length}`, pageWidth / 2, 100, { align: 'center' });
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 110, { align: 'center' });

    // Processar cada produto
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Callback de progresso
      if (onProgress) {
        onProgress(i + 1, products.length);
      }

      // Nova página para cada produto
      pdf.addPage();

      let yPosition = margin + 10;

      // Título do produto
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(product.name, margin, yPosition);
      yPosition += 10;

      // Subtítulo
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Produto #${product.number} - ${product.category}`, margin, yPosition);
      yPosition += 15;
      pdf.setTextColor(0, 0, 0);

      // Foto do produto (se existir)
      if (product.photoUrl) {
        try {
          const img = await loadImage(product.photoUrl);
          const imgWidth = 80;
          const imgHeight = (img.height / img.width) * imgWidth;
          
          // Centralizar imagem
          const imgX = (pageWidth - imgWidth) / 2;
          pdf.addImage(img, 'JPEG', imgX, yPosition, imgWidth, Math.min(imgHeight, 100));
          yPosition += Math.min(imgHeight, 100) + 10;
        } catch (error) {
          console.error(`Erro ao carregar foto do produto ${product.number}:`, error);
          // Continuar sem a foto
        }
      }

      // Box de informações básicas
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, contentWidth / 2 - 5, 30, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Código de Barras', margin + 3, yPosition + 6);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(product.barcode || 'N/A', margin + 3, yPosition + 12);

      // Box de unidades
      pdf.setFillColor(255, 248, 225);
      pdf.rect(pageWidth / 2 + 5, yPosition, contentWidth / 2 - 5, 30, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Unidades por Caixa', pageWidth / 2 + 8, yPosition + 6);
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${product.unitsPerCase} unités`, pageWidth / 2 + 8, yPosition + 15);

      yPosition += 40;

      // Informações de Base
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações de Base', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Coût Unitaire:', margin + 5, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${parseFloat(product.unitCost).toFixed(2)}`, margin + 60, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.text('Coût du Case:', margin + 5, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${parseFloat(product.caseCost).toFixed(2)}`, margin + 60, yPosition);
      yPosition += 12;

      // Informações Comerciais (destaque)
      pdf.setFillColor(255, 248, 225);
      pdf.rect(margin, yPosition, contentWidth, 35, 'F');
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações Comerciais', margin + 3, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Prix Unitaire:', margin + 5, yPosition);
      pdf.setFontSize(14);
      pdf.setTextColor(0, 128, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${parseFloat(product.retailPrice).toFixed(2)}`, margin + 60, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Profit Unitaire:', margin + 5, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${parseFloat(product.unitProfit).toFixed(2)}`, margin + 60, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.text('Marge:', margin + 5, yPosition);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${product.margin}%`, margin + 60, yPosition);
      pdf.setTextColor(0, 0, 0);

      // Rodapé da página
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Página ${i + 2} de ${products.length + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
    }

    // Salvar PDF
    const fileName = `${catalogName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

/**
 * Carrega uma imagem de uma URL
 * @param {string} url - URL da imagem
 * @returns {Promise<HTMLImageElement>}
 */
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Exporta apenas um produto para PDF
 * @param {object} product - Objeto do produto
 * @returns {Promise<void>}
 */
export const exportProductToPDF = async (product) => {
  return exportCatalogToPDF([product], `Produto_${product.number}`);
};

/**
 * Exporta produtos de uma categoria específica
 * @param {Array} products - Array de produtos
 * @param {string} category - Nome da categoria
 * @returns {Promise<void>}
 */
export const exportCategoryToPDF = async (products, category) => {
  const categoryProducts = products.filter(p => p.category === category);
  return exportCatalogToPDF(categoryProducts, `Categoria_${category}`);
};

export default {
  exportCatalogToPDF,
  exportProductToPDF,
  exportCategoryToPDF
};

