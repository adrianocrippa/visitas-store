import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enrichProductsWithPhotos } from '../../utils/photoMatcher';

const CatalogViewer = () => {
  const { userId } = useParams();
  const [catalogData, setCatalogData] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    // Carregar dados do catálogo
    const loadCatalog = async () => {
      try {
        const data = localStorage.getItem(`catalog_${userId}`);
        if (data) {
          const catalog = JSON.parse(data);
          
          console.log('📂 Catálogo carregado:', {
            timestamp: catalog.timestamp,
            totalProducts: catalog.products.length
          });

          // Carregar fotos dos produtos
          setLoadingPhotos(true);
          const productsWithPhotos = await enrichProductsWithPhotos(userId, catalog.products);
          
          setCatalogData({
            ...catalog,
            products: productsWithPhotos
          });
          
          console.log('📸 Fotos carregadas:', {
            withPhoto: productsWithPhotos.filter(p => p.photoUrl).length,
            withoutPhoto: productsWithPhotos.filter(p => !p.photoUrl).length
          });
          
          setLoadingPhotos(false);
        }
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();

    // Recarregar quando a janela ganhar foco (detecta atualizações)
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
  const generatedDate = catalogData.timestamp ? new Date(catalogData.timestamp).toLocaleString('pt-BR') : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentProduct + 1} de {catalogData.products.length}
            </span>
            {generatedDate && (
              <span className="text-xs text-gray-500">
                {generatedDate}
              </span>
            )}
            <Link 
              to="/dashboard" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Product Display */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Product Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <p className="text-gray-600">Produto #{product.number} - {product.category}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Photo */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
              {loadingPhotos ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Carregando foto...</p>
                </div>
              ) : product.photoUrl ? (
                <img 
                  src={product.photoUrl} 
                  alt={product.name}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ESem foto%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="mx-auto h-32 w-32 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Foto do Produto</p>
                  <p className="text-xs mt-1">Faça upload no Dashboard</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Barcode & Units */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Código de Barras</p>
                  <p className="text-lg font-semibold">{product.barcode || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Unidades por Caixa</p>
                  <p className="text-lg font-semibold">{product.unitsPerCase} unités</p>
                </div>
              </div>

              {/* Cost Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações de Base</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coût Unitaire:</span>
                    <span className="font-semibold">${parseFloat(product.unitCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coût du Case:</span>
                    <span className="font-semibold">${parseFloat(product.caseCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Informações Comerciais</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix Unitaire:</span>
                    <span className="text-xl font-bold text-green-600">${parseFloat(product.retailPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Unitaire:</span>
                    <span className="font-semibold">${parseFloat(product.unitProfit).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                    <span className="text-gray-600">Marge:</span>
                    <span className="text-2xl font-bold text-blue-600">{product.margin}%</span>
                  </div>
                </div>
              </div>

              {/* Barcode QR (placeholder) */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-24 w-24 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm11-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-5 0h3v3h-3v-3z"/>
                </svg>
                <p className="text-xs text-gray-500 mt-2">Código de Barras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={prevProduct}
            disabled={currentProduct === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <p className="text-sm text-gray-600">
            Use as setas ← → do teclado para navegar
          </p>

          <button
            onClick={nextProduct}
            disabled={currentProduct === catalogData.products.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Próximo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogViewer;

