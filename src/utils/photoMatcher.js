import { supabase } from '../supabase';

/**
 * Busca foto de um produto no banco de dados
 * @param {string} userId - ID do usuário
 * @param {object} product - Objeto do produto com number, barcode, name
 * @returns {Promise<string|null>} URL da foto ou null
 */
export const getProductPhoto = async (userId, product) => {
  try {
    // Tentar por número do produto primeiro
    if (product.number) {
      const { data, error } = await supabase
        .from('product_photos')
        .select('photo_url')
        .eq('user_id', userId)
        .eq('product_number', product.number)
        .single();

      if (!error && data) {
        return data.photo_url;
      }
    }

    // Tentar por código de barras
    if (product.barcode) {
      const { data, error } = await supabase
        .from('product_photos')
        .select('photo_url')
        .eq('user_id', userId)
        .eq('barcode', product.barcode)
        .single();

      if (!error && data) {
        return data.photo_url;
      }
    }

    // Tentar por nome do produto (busca parcial)
    if (product.name) {
      const { data, error } = await supabase
        .from('product_photos')
        .select('photo_url')
        .eq('user_id', userId)
        .ilike('product_name', `%${product.name.substring(0, 20)}%`)
        .limit(1)
        .single();

      if (!error && data) {
        return data.photo_url;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar foto do produto:', error);
    return null;
  }
};

/**
 * Busca todas as fotos do usuário e cria um mapa para acesso rápido
 * @param {string} userId - ID do usuário
 * @returns {Promise<Map>} Mapa com product_number como chave e photo_url como valor
 */
export const loadAllPhotos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('product_photos')
      .select('product_number, barcode, photo_url')
      .eq('user_id', userId);

    if (error) throw error;

    const photoMap = new Map();
    
    data.forEach(photo => {
      // Mapear por número do produto
      if (photo.product_number) {
        photoMap.set(`num_${photo.product_number}`, photo.photo_url);
      }
      // Mapear por código de barras
      if (photo.barcode) {
        photoMap.set(`bar_${photo.barcode}`, photo.photo_url);
      }
    });

    return photoMap;
  } catch (error) {
    console.error('Erro ao carregar fotos:', error);
    return new Map();
  }
};

/**
 * Busca foto usando o mapa pré-carregado (mais eficiente)
 * @param {Map} photoMap - Mapa de fotos pré-carregado
 * @param {object} product - Objeto do produto
 * @returns {string|null} URL da foto ou null
 */
export const getPhotoFromMap = (photoMap, product) => {
  // Tentar por número do produto
  if (product.number) {
    const photo = photoMap.get(`num_${product.number}`);
    if (photo) return photo;
  }

  // Tentar por código de barras
  if (product.barcode) {
    const photo = photoMap.get(`bar_${product.barcode}`);
    if (photo) return photo;
  }

  return null;
};

/**
 * Adiciona URLs de fotos a uma lista de produtos
 * @param {string} userId - ID do usuário
 * @param {Array} products - Array de produtos
 * @returns {Promise<Array>} Array de produtos com campo photoUrl adicionado
 */
export const enrichProductsWithPhotos = async (userId, products) => {
  try {
    // Carregar todas as fotos de uma vez (mais eficiente)
    const photoMap = await loadAllPhotos(userId);

    // Adicionar foto a cada produto
    return products.map(product => ({
      ...product,
      photoUrl: getPhotoFromMap(photoMap, product) || null
    }));
  } catch (error) {
    console.error('Erro ao enriquecer produtos com fotos:', error);
    return products.map(p => ({ ...p, photoUrl: null }));
  }
};

/**
 * Verifica se um produto tem foto
 * @param {string} userId - ID do usuário
 * @param {string} productNumber - Número do produto
 * @returns {Promise<boolean>} true se tem foto, false caso contrário
 */
export const hasProductPhoto = async (userId, productNumber) => {
  try {
    const { data, error } = await supabase
      .from('product_photos')
      .select('id')
      .eq('user_id', userId)
      .eq('product_number', productNumber)
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Conta quantos produtos têm foto
 * @param {string} userId - ID do usuário
 * @returns {Promise<number>} Número de produtos com foto
 */
export const countProductsWithPhotos = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('product_photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar fotos:', error);
    return 0;
  }
};

export default {
  getProductPhoto,
  loadAllPhotos,
  getPhotoFromMap,
  enrichProductsWithPhotos,
  hasProductPhoto,
  countProductsWithPhotos
};

