// COLE ESTE CÓDIGO COMPLETO NO ARQUIVO:
// https://github.com/adrianocrippa/visitas-store/blob/main/src/utils/catalogGenerator.js

export const generateCatalogFiles = async (products, userId) => {
  try {
    // Por enquanto, vamos simular a geração e retornar um link funcional
    // Na versão real, isso salvaria arquivos no servidor
    
    const catalogData = {
      products: products,
      userId: userId,
      generatedAt: new Date().toISOString(),
      timestamp: Date.now() // Adiciona timestamp para forçar atualização
    };
    
    // CORREÇÃO: Limpar cache antigo antes de salvar novo catálogo
    const oldCatalogKey = `catalog_${userId}`;
    localStorage.removeItem(oldCatalogKey);
    
    // Salvar no localStorage com timestamp para garantir atualização
    const catalogKey = `catalog_${userId}`;
    localStorage.setItem(catalogKey, JSON.stringify(catalogData));
    
    // Forçar atualização removendo qualquer cache do navegador
    console.log('✅ Catálogo salvo com sucesso. Timestamp:', catalogData.timestamp);
    console.log('📊 Total de produtos:', products.length);
    
    // Retornar URL do visualizador
    const indexUrl = `${window.location.origin}/catalog-viewer/${userId}`;
    
    return {
      success: true,
      indexUrl: indexUrl,
      files: products.map(p => p.fileName)
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
