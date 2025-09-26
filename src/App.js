import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

// Dashboard simples para teste
const Dashboard = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Dashboard</h1>
      <p className="text-gray-600 mb-6">Bem-vindo à CatalogPro!</p>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Catálogos</h3>
          <p className="text-gray-600">Gerencie seus catálogos de produtos</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Visitas</h3>
          <p className="text-gray-600">Sistema de visitas integrado</p>
        </div>
      </div>
      <a href="/" className="mt-6 inline-block text-blue-600 hover:text-blue-700">
        ← Voltar ao início
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
