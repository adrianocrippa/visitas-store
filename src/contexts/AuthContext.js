// =====================================================
// CONTEXT DE AUTENTICAÇÃO
// =====================================================
// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  getUserProfile 
} from '../supabase';

// Criar contexto
const AuthContext = createContext({});

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // EFEITOS E LISTENERS
  // =====================================================

  useEffect(() => {
  checkUser();
}, [checkUser]);


  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  const checkUser = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      
      if (error) {
        console.error('Erro ao verificar usuário:', error);
        setError(error.message);
        return;
      }

      if (currentUser) {
        await loadUserData(currentUser);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro ao verificar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (authUser) => {
    try {
      setUser(authUser);
      
      // Carregar dados do perfil
      const { data: profile, error } = await getUserProfile(authUser.id);
      
      if (error) {
        console.error('Erro ao carregar perfil:', error);
        // Não é crítico, continua com dados básicos
        setUserProfile({
          id: authUser.id,
          email: authUser.email,
          company_name: authUser.user_metadata?.company_name || 'Empresa',
          subscription_plan: 'free'
        });
      } else {
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  // =====================================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // =====================================================

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // loadUserData será chamado pelo listener onAuthStateChange
      return { success: true, data };
    } catch (err) {
      const errorMessage = 'Erro inesperado no login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, companyData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await signUp(email, password, companyData);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data,
        message: 'Conta criada! Verifique seu email para confirmar.' 
      };
    } catch (err) {
      const errorMessage = 'Erro inesperado no registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Estado será limpo pelo listener onAuthStateChange
      return { success: true };
    } catch (err) {
      const errorMessage = 'Erro inesperado no logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { updateUserProfile } = await import('../supabase');
      const { data, error } = await updateUserProfile(user.id, updates);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Atualizar estado local
      setUserProfile(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNÇÕES DE UTILIDADE
  // =====================================================

  const isAuthenticated = () => {
    return !!user;
  };

  const hasSubscription = (planLevel = 'basic') => {
    if (!userProfile) return false;
    
    const plans = ['free', 'basic', 'pro', 'enterprise'];
    const userPlanIndex = plans.indexOf(userProfile.subscription_plan);
    const requiredPlanIndex = plans.indexOf(planLevel);
    
    return userPlanIndex >= requiredPlanIndex;
  };

  const canCreateCatalogs = () => {
    if (!userProfile) return false;
    
    // Lógica baseada no plano
    const limits = {
      free: 1,
      basic: 3,
      pro: 10,
      enterprise: -1 // ilimitado
    };
    
    const limit = limits[userProfile.subscription_plan] || 0;
    return limit === -1 || (userProfile.catalogs_count || 0) < limit;
  };

  const clearError = () => {
    setError(null);
  };

  // =====================================================
  // VALOR DO CONTEXTO
  // =====================================================

  const value = {
    // Estado
    user,
    userProfile,
    loading,
    error,
    
    // Funções de autenticação
    login,
    register,
    logout,
    updateProfile,
    
    // Funções de utilidade
    isAuthenticated,
    hasSubscription,
    canCreateCatalogs,
    clearError,
    
    // Dados computados
    isLoggedIn: isAuthenticated(),
    userName: userProfile?.company_name || user?.email || 'Usuário',
    userEmail: user?.email || '',
    subscriptionPlan: userProfile?.subscription_plan || 'free'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// HOC PARA PROTEÇÃO DE ROTAS
// =====================================================

export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Você precisa estar logado para acessar esta página.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Fazer Login
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// =====================================================
// HOOK PARA VERIFICAR PERMISSÕES
// =====================================================

export const usePermissions = () => {
  const { userProfile, hasSubscription, canCreateCatalogs } = useAuth();

  return {
    canCreateCatalogs: canCreateCatalogs(),
    canUseAnalytics: hasSubscription('basic'),
    canCustomizeBranding: hasSubscription('pro'),
    canUseAPI: hasSubscription('enterprise'),
    maxCatalogs: {
      free: 1,
      basic: 3,
      pro: 10,
      enterprise: -1
    }[userProfile?.subscription_plan || 'free'],
    maxProducts: {
      free: 50,
      basic: 200,
      pro: 1000,
      enterprise: -1
    }[userProfile?.subscription_plan || 'free']
  };
};

export default AuthContext;
