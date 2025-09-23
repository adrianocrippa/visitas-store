// =====================================================
// CONFIGURAÇÃO EXPANDIDA DO SUPABASE
// =====================================================
// Substitua o arquivo src/supabase.js existente por este

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (use suas variáveis de ambiente)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// FUNÇÕES DE AUTENTICAÇÃO
// =====================================================

/**
 * Registrar novo usuário
 */
export const signUp = async (email, password, companyData) => {
  try {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyData.companyName,
          phone: companyData.phone || null,
          website: companyData.website || null
        }
      }
    });

    if (authError) throw authError;

    // 2. Criar registro na tabela users
    if (authData.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          company_name: companyData.companyName,
          phone: companyData.phone || null,
          website: companyData.website || null,
          subscription_plan: 'free'
        }]);

      if (userError) throw userError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { data: null, error };
  }
};

/**
 * Login do usuário
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Erro no login:', error);
    return { data: null, error };
  }
};

/**
 * Logout do usuário
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { error };
  }
};

/**
 * Obter usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return { user: null, error };
  }
};

/**
 * Obter dados completos do usuário
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return { data: null, error };
  }
};

/**
 * Atualizar perfil do usuário
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { data: null, error };
  }
};

// =====================================================
// FUNÇÕES DE CATÁLOGO
// =====================================================

/**
 * Criar novo catálogo
 */
export const createCatalog = async (catalogData) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .insert([catalogData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar catálogo:', error);
    return { data: null, error };
  }
};

/**
 * Obter catálogos do usuário
 */
export const getUserCatalogs = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select(`
        *,
        products(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter catálogos:', error);
    return { data: null, error };
  }
};

/**
 * Obter catálogo específico
 */
export const getCatalog = async (catalogId) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select(`
        *,
        users(company_name, logo_url),
        products(*)
      `)
      .eq('id', catalogId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter catálogo:', error);
    return { data: null, error };
  }
};

/**
 * Atualizar catálogo
 */
export const updateCatalog = async (catalogId, updates) => {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .update(updates)
      .eq('id', catalogId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar catálogo:', error);
    return { data: null, error };
  }
};

/**
 * Deletar catálogo
 */
export const deleteCatalog = async (catalogId) => {
  try {
    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', catalogId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar catálogo:', error);
    return { error };
  }
};

// =====================================================
// FUNÇÕES DE PRODUTOS
// =====================================================

/**
 * Criar produtos em lote
 */
export const createProducts = async (products) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar produtos:', error);
    return { data: null, error };
  }
};

/**
 * Obter produtos do catálogo
 */
export const getCatalogProducts = async (catalogId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('catalog_id', catalogId)
      .order('slide_number', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return { data: null, error };
  }
};

/**
 * Atualizar produto
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { data: null, error };
  }
};

// =====================================================
// FUNÇÕES DE ANALYTICS
// =====================================================

/**
 * Registrar visualização de catálogo
 */
export const recordCatalogView = async (catalogId, productId = null, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('catalog_views')
      .insert([{
        catalog_id: catalogId,
        product_id: productId,
        ip_address: metadata.ip || null,
        user_agent: metadata.userAgent || navigator.userAgent,
        country: metadata.country || null,
        city: metadata.city || null
      }]);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    return { data: null, error };
  }
};

/**
 * Obter analytics do catálogo
 */
export const getCatalogAnalytics = async (catalogId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('catalog_views')
      .select(`
        *,
        products(name, slide_number)
      `)
      .eq('catalog_id', catalogId)
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter analytics:', error);
    return { data: null, error };
  }
};

// =====================================================
// FUNÇÕES DE VISITAS (MANTER COMPATIBILIDADE)
// =====================================================

/**
 * Criar visita (compatível com sistema existente)
 */
export const createVisita = async (visitaData, userId = null) => {
  try {
    const dataToInsert = {
      ...visitaData,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('visitas')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar visita:', error);
    return { data: null, error };
  }
};

/**
 * Obter visitas do usuário
 */
export const getUserVisitas = async (userId = null) => {
  try {
    let query = supabase
      .from('visitas')
      .select('*')
      .order('data', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Para compatibilidade com dados antigos
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter visitas:', error);
    return { data: null, error };
  }
};

// =====================================================
// FUNÇÕES DE UPLOAD
// =====================================================

/**
 * Upload de arquivo para storage
 */
export const uploadFile = async (file, bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  } catch (error) {
    console.error('Erro no upload:', error);
    return { data: null, error };
  }
};

/**
 * Deletar arquivo do storage
 */
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { error };
  }
};

// =====================================================
// LISTENERS DE MUDANÇAS EM TEMPO REAL
// =====================================================

/**
 * Escutar mudanças em catálogos
 */
export const subscribeToCatalogChanges = (userId, callback) => {
  return supabase
    .channel('catalog-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'catalogs',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

/**
 * Escutar mudanças em produtos
 */
export const subscribeToProductChanges = (catalogId, callback) => {
  return supabase
    .channel('product-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `catalog_id=eq.${catalogId}`
      },
      callback
    )
    .subscribe();
};

// =====================================================
// EXPORT DEFAULT
// =====================================================
export default supabase;
