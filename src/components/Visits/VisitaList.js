// src/VisitaList.js
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function VisitaList() {
  const [visitas, setVisitas] = useState([]);
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    // fetchVisitas agora está definido aqui, dentro do useEffect
    async function fetchVisitas() {
      let query = supabase
        .from('visitas')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroLoja) {
        query = query.eq('loja', filtroLoja);
      }
      if (filtroData) {
        query = query.gte('created_at', filtroData);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar visitas:', error);
      } else {
        setVisitas(data);
      }
    }

    fetchVisitas();
  }, [filtroLoja, filtroData]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Lista de visitas</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={filtroLoja}
          onChange={e => setFiltroLoja(e.target.value)}
          placeholder="Filtrar por loja"
        />
        <input
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
        />
        <button onClick={() => {/* dispara novamente o effect */}}>Aplicar filtros</button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Data</th>
            <th>Loja</th>
            <th>Contato</th>
            <th>Comentários</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {visitas.map(v => (
            <tr key={v.id}>
              <td>{new Date(v.created_at).toLocaleString()}</td>
              <td>{v.loja}</td>
              <td>{v.contato}</td>
              <td>{v.comentarios}</td>
              <td>
                {v.photo_path
                  ? (
                    <a
                      href={`https://ldagvzsodenuurkbmfcd.supabase.co/storage/v1/object/public/fotos/${v.photo_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver foto
                    </a>
                  )
                  : '—'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
