import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { processExcelFile } from '../../utils/excelProcessor';
import { generateCatalogFiles } from '../../utils/catalogGenerator';

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Por favor, selecione um arquivo Excel (.xlsx)');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    
    try {
      // Passo 1: Processar Excel
      setProcessingStep('Processando planilha Excel...');
      const excelResult = await processExcelFile(file);
      
      if (!excelResult.success) {
        throw new Error(excelResult.error);
      }

      // Passo 2: Gerar arquivos HTML
      setProcessingStep('Gerando catálogo HTML...');
      const catalogResult = await generateCatalogFiles(excelResult.products, user.id);
      
      if (!catalogResult.success) {
        throw new Error(catalogResult.error);
      }

      // Passo 3: Sucesso
      setResult({
        success: true,
        catalogUrl: catalogResult.indexUrl,
        productsCount: excelResult.totalProducts,
        categories: excelResult.categories,
        message: 'Catálogo gerado com sucesso!',
        files: catalogResult.files
      });
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao processar arquivo: ' + error.message
      });
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Gerar Catálogo
      </h2>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {file ? file.name : 'Selecione sua planilha Excel'}
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx"
                onChange={handleFileChange}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Apenas arquivos .xlsx são suportados
            </p>
          </div>
        </div>

        {/* Upload Button */}
        {file && !loading && (
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Gerar Catálogo
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">
              {processingStep || 'Processando...'}
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </h3>
                {result.success && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>✅ {result.productsCount} produtos processados</p>
                    <p>✅ {result.categories?.length} categorias encontradas</p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <strong>Catálogo gerado:</strong>
                      </div>
                      <a 
                        href={result.catalogUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        🔗 Abrir Catálogo
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploader;
