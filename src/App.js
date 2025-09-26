import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import './App.css';

// Componentes simples para teste
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
