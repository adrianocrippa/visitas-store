import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">CatalogPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {userProfile?.company_name}</span>
              <button 
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/catalogs" 
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold mb-2">Catálogos</h3>
            <p className="text-gray-600">Gerencie seus catálogos de produtos</p>
          </Link>
          
          <Link 
            to="/visits" 
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold mb-2">Visitas</h3>
            <p className="text-gray-600">Registre e acompanhe suas visitas</p>
          </Link>
          
          <Link 
            to="/analytics" 
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">Veja estatísticas e relatórios</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
