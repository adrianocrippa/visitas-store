import React, { createContext, useContext, useState } from 'react';

// Criar o contexto
const AuthContext = createContext();

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
  const [loading, setLoading] = useState(false);

  // Função de login simples
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simular login por enquanto
      console.log('Login:', email, password);
      setUser({ email, id: '123' });
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro simples
  const register = async (email, password, companyName) => {
    setLoading(true);
    try {
      // Simular registro por enquanto
      console.log('Register:', email, password, companyName);
      setUser({ email, id: '123', companyName });
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
