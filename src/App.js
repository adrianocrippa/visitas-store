// =====================================================
// APP PRINCIPAL COM ROTEAMENTO E AUTENTICAÇÃO
// =====================================================
// src/App.js - SUBSTITUA o arquivo existente

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes de Autenticação
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Componentes da Landing Page
import LandingPage from './components/Landing/LandingPage';

// Componentes do Dashboard (protegidos)
import Dashboard from './components/Dashboard/Dashboard';
import CatalogManager from './components/Catalog/CatalogManager';
import CatalogViewer from './components/Catalog/CatalogViewer';
import Analytics from './components/Dashboard/Analytics';
import Profile from './components/Dashboard/Profile';

// Componentes de Visitas (existentes, agora integrados)
import VisitasPage from './components/Visits/VisitasPage';

// Estilos
import './App.css';

// =====================================================
// COMPONENTE DE ROTA PROTEGIDA
// =====================================================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// =====================================================
// COMPONENTE DE ROTA PÚBLICA (só para não logados)
// =====================================================
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// =====================================================
// COMPONENTE PRINCIPAL DO APP
// =====================================================
const AppContent = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ===== ROTAS PÚBLICAS ===== */}
          
          {/* Landing Page */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />

          {/* Autenticação */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* ===== ROTAS PROTEGIDAS ===== */}
          
          {/* Dashboard Principal */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Gerenciamento de Catálogos */}
          <Route 
            path="/catalogs" 
            element={
              <ProtectedRoute>
                <CatalogManager />
              </ProtectedRoute>
            } 
          />

          {/* Visualização de Catálogo Específico */}
          <Route 
            path="/catalog/:catalogId" 
            element={
              <ProtectedRoute>
                <CatalogViewer />
              </ProtectedRoute>
            } 
          />

          {/* Analytics */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Perfil do Usuário */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Visitas (funcionalidade existente integrada) */}
          <Route 
            path="/visits" 
            element={
              <ProtectedRoute>
                <VisitasPage />
              </ProtectedRoute>
            } 
          />

          {/* ===== ROTAS PÚBLICAS DE CATÁLOGO ===== */}
          
          {/* Visualização pública de catálogo (sem autenticação) */}
          <Route 
            path="/public/catalog/:catalogId" 
            element={<CatalogViewer isPublic={true} />} 
          />

          {/* ===== ROTAS DE ERRO ===== */}
          
          {/* 404 - Página não encontrada */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Página não encontrada
                  </h1>
                  <p className="text-gray-600 mb-6">
                    A página que você está procurando não existe.
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={() => window.history.back()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                    >
                      Voltar
                    </button>
                    <a
                      href="/"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 inline-block"
                    >
                      Ir para o Início
                    </a>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

// =====================================================
// COMPONENTE RAIZ COM PROVIDERS
// =====================================================
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

// =====================================================
// NOTAS DE IMPLEMENTAÇÃO
// =====================================================

/*
ESTRUTURA DE PASTAS RECOMENDADA:

src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── ForgotPassword.js
│   ├── Dashboard/
│   │   ├── Dashboard.js
│   │   ├── Analytics.js
│   │   ├── Profile.js
│   │   └── Sidebar.js
│   ├── Catalog/
│   │   ├── CatalogManager.js
│   │   ├── CatalogViewer.js
│   │   ├── ExcelUploader.js
│   │   ├── ProductCard.js
│   │   └── SlideGenerator.js
│   ├── Landing/
│   │   ├── LandingPage.js
│   │   ├── Hero.js
│   │   ├── Features.js
│   │   ├── Pricing.js
│   │   └── About.js
│   ├── Visits/
│   │   ├── VisitasPage.js
│   │   ├── VisitaForm.js (existente)
│   │   └── VisitaList.js (existente)
│   └── Common/
│       ├── Header.js
│       ├── Footer.js
│       ├── Loading.js
│       └── ErrorBoundary.js
├── contexts/
│   ├── AuthContext.js
│   └── CatalogContext.js
├── hooks/
│   ├── useAuth.js
│   ├── useCatalog.js
│   └── useAnalytics.js
├── utils/
│   ├── excelProcessor.js
│   ├── slideGenerator.js
│   ├── analytics.js
│   └── constants.js
├── styles/
│   ├── globals.css
│   └── components.css
├── supabase.js (enhanced)
├── App.js (este arquivo)
└── index.js

PRÓXIMOS PASSOS:

1. Instalar dependências:
   npm install react-router-dom

2. Criar os componentes em falta:
   - Dashboard/Dashboard.js
   - Catalog/CatalogManager.js
   - Catalog/CatalogViewer.js
   - Dashboard/Analytics.js
   - Dashboard/Profile.js
   - Visits/VisitasPage.js (wrapper dos existentes)

3. Configurar o banco no Supabase:
   - Executar o script database_setup.sql
   - Configurar as variáveis de ambiente

4. Testar o fluxo completo:
   - Registro → Login → Dashboard → Catálogos

5. Deploy:
   - Vercel (frontend)
   - Supabase (backend)
*/
