// src/VisitaForm.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from './supabase';

export function VisitaForm() {
  const { register, handleSubmit, reset } = useForm();

  async function onSubmit(data) {
    let photoPath = null;

    if (data.foto[0]) {
      const file = data.foto[0];
      // 1) montar um nome de arquivo “seguro”
      let fileName = `${Date.now()}-${file.name}`;
      // substituir tudo que não for letra, número, underline, hífen ou ponto
      fileName = fileName.replace(/[^A-Za-z0-9_\-.]/g, '_');

      // 2) fazer upload com upsert: false
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('fotos')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        alert('Erro no upload: ' + uploadError.message);
        return;
      }
      // uploadData.path contém o caminho
      photoPath = uploadData.path;
    }

    // 3) inserir no banco usando a coluna photo_path
    const { error: insertError } = await supabase
      .from('visitas')
      .insert({
        loja: data.loja,
        endereco: data.endereco,
        contato: data.contato,
        comentarios: data.comentarios,
        photo_path: photoPath,
      });

    if (insertError) {
      alert('Erro ao salvar visita: ' + insertError.message);
    } else {
      alert('Visita registrada com sucesso!');
      reset();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '8px', maxWidth: 400 }}>
      <input {...register('loja')} placeholder="Nome da loja" required />
      <input {...register('endereco')} placeholder="Endereço" />
      <input {...register('contato')} placeholder="Contato (nome / telefone)" />
      <textarea {...register('comentarios')} placeholder="Comentários" rows={3} />
      <input type="file" {...register('foto')} accept="image/*" />
      <button type="submit">Salvar visita</button>
    </form>
  );
}
