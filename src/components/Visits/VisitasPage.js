import React from 'react';

const VisitasPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gerenciar Visitas
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sistema de Visitas</h2>
          <p className="text-gray-600 mb-4">
            Esta seção será integrada com seus componentes existentes de visitas.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Em Desenvolvimento
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Os componentes VisitaForm e VisitaList serão integrados aqui 
                    após o sistema principal estar funcionando.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
              Nova Visita
            </button>
            <button className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200">
              Ver Todas as Visitas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitasPage;
