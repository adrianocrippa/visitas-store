// COLE ESTE CÓDIGO COMPLETO NO ARQUIVO:
// https://github.com/adrianocrippa/visitas-store/blob/main/src/components/Catalog/CatalogViewer.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CatalogViewer = () => {
  const { userId } = useParams();
  const [catalogData, setCatalogData] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar dados do catálogo
    const loadCatalog = () => {
      try {
        const data = localStorage.getItem(`catalog_${userId}`);
        if (data) {
          const catalog = JSON.parse(data);
          console.log('📂 Catálogo carregado:', {
            timestamp: catalog.timestamp,
            generatedAt: catalog.generatedAt,
            totalProducts: catalog.products.length
          });
          setCatalogData(catalog);
        }
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
    
    // Recarregar quando a janela receber foco (útil após upload)
    const handleFocus = () => {
      loadCatalog();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId]);

  const nextProduct = () => {
    if (catalogData && currentProduct < catalogData.products.length - 1) {
      setCurrentProduct(currentProduct + 1);
    }
  };

  const prevProduct = () => {
    if (currentProduct > 0) {
      setCurrentProduct(currentProduct - 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight') nextProduct();
    if (e.key === 'ArrowLeft') prevProduct();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentProduct, catalogData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (!catalogData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catálogo não encontrado</h1>
          <p className="text-gray-600 mb-6">O catálogo solicitado não existe ou foi removido.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const product = catalogData.products[currentProduct];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Catálogo de Produtos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentProduct + 1} de {catalogData.products.length}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(catalogData.generatedAt).toLocaleString('pt-BR')}
              </span>
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Display */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Product Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">
              Produto #{product.number} - {product.category}
            </p>
          </div>

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo Space */}
            <div className="lg:col-span-1">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Foto do Produto</p>
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Código de Barras</h3>
                  <p className="text-lg">{product.barcode || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Unidades por Caixa</h3>
                  <p className="text-lg font-bold">{product.unitsPerCase} unités</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Informações de Base</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Coût Unitaire:</span>
                      <span>${parseFloat(product.unitCost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coût du Case:</span>
                      <span>${parseFloat(product.caseCost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Informações Comerciais</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between bg-yellow-100 p-2 rounded">
                      <span className="font-semibold">Prix Unitaire:</span>
                      <span className="font-bold">${parseFloat(product.retailPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Unitaire:</span>
                      <span>${parseFloat(product.unitProfit).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-yellow-100 p-2 rounded">
                      <span className="font-semibold">Marge:</span>
                      <span className="font-bold">{product.margin}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode Space */}
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Código de Barras</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={prevProduct}
              disabled={currentProduct === 0}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Use as setas ← → do teclado para navegar
              </p>
            </div>

            <button
              onClick={nextProduct}
              disabled={currentProduct === catalogData.products.length - 1}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogViewer;
