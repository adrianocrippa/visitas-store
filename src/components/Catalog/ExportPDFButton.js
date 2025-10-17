import React, { useState } from 'react';
import { exportCatalogToPDF, exportCategoryToPDF } from '../../utils/pdfExporter';

const ExportPDFButton = ({ products, catalogName = 'Catalogo' }) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showOptions, setShowOptions] = useState(false);

  const handleExportAll = async () => {
    setExporting(true);
    setShowOptions(false);
    
    try {
      await exportCatalogToPDF(products, catalogName, (current, total) => {
        setProgress({ current, total });
      });
      
      alert('✅ PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('❌ Erro ao gerar PDF: ' + error.message);
    } finally {
      setExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleExportCategory = async (category) => {
    setExporting(true);
    setShowOptions(false);
    
    try {
      await exportCategoryToPDF(products, category, (current, total) => {
        setProgress({ current, total });
      });
      
      alert(`✅ PDF da categoria "${category}" gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('❌ Erro ao gerar PDF: ' + error.message);
    } finally {
      setExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Obter categorias únicas
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {exporting ? (
          <span>Gerando PDF... {progress.current}/{progress.total}</span>
        ) : (
          <span>Exportar PDF</span>
        )}
      </button>

      {/* Dropdown de opções */}
      {showOptions && !exporting && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <button
              onClick={handleExportAll}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Catálogo Completo ({products.length} produtos)
            </button>

            {categories.length > 1 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
                  Por Categoria:
                </div>
                {categories.map((category) => {
                  const count = products.filter(p => p.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => handleExportCategory(category)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span className="truncate">{category}</span>
                      <span className="text-xs text-gray-500 ml-2">({count})</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar dropdown */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowOptions(false)}
        ></div>
      )}
    </div>
  );
};

export default ExportPDFButton;

