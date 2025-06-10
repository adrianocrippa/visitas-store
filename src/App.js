import React from 'react';
import { VisitaForm } from './VisitaForm';
import { VisitaList } from './VisitaList';

function App() {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Visitas a Lojas</h1>
      <VisitaForm />
      <VisitaList />
    </div>
  );
}

export default App;
