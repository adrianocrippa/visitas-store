import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componente simples para teste
const HomePage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🎉 CatalogPro - Sistema Funcionando!</h1>
    <p>Transforme suas planilhas Excel em catálogos profissionais</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/login" style={{ margin: '10px', padding: '10px 20px', background: '#3B82F6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Login
      </a>
      <a href="/register" style={{ margin: '10px', padding: '10px 20px', background: '#10B981', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Registro
      </a>
    </div>
  </div>
);

const LoginPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Login</h2>
    <p>Página de login em desenvolvimento...</p>
    <a href="/">← Voltar</a>
  </div>
);

const RegisterPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Registro</h2>
    <p>Página de registro em desenvolvimento...</p>
    <a href="/">← Voltar</a>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
