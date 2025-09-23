import React from 'react';
import VisitaForm from './VisitaForm';
import VisitaList from './VisitaList';

const VisitasPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gerenciar Visitas
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Nova Visita</h2>
            <VisitaForm />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Visitas Recentes</h2>
            <VisitaList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitasPage;
