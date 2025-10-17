import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const PhotoUploader = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Carregar fotos já enviadas
  useEffect(() => {
    if (user) {
      loadUploadedPhotos();
    }
  }, [user]);

  const loadUploadedPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('product_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUploadedPhotos(data || []);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const photoFiles = files.filter(file => file.type.startsWith('image/'));
    
    const photoData = photoFiles.map(file => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      productNumber: extractProductNumber(file.name),
      barcode: extractBarcode(file.name),
      status: 'pending'
    }));

    setPhotos(photoData);
  };

  // Extrair número do produto do nome do arquivo
  // Formatos aceitos: 003_cafe_3c_500g.jpg, 003.jpg, produto_003.jpg
  const extractProductNumber = (filename) => {
    const match = filename.match(/(\d{3})/);
    return match ? match[1] : null;
  };

  // Extrair código de barras do nome do arquivo
  // Formato: 7896045102426.jpg ou barcode_7896045102426.jpg
  const extractBarcode = (filename) => {
    const match = filename.match(/(\d{10,14})/);
    return match ? match[1] : null;
  };

  const uploadPhotos = async () => {
    if (!user || photos.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: photos.length });

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Upload para Storage
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${user.id}/${photo.productNumber || Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-photos')
          .upload(fileName, photo.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-photos')
          .getPublicUrl(fileName);

        // Salvar registro no banco
        const { error: dbError } = await supabase
          .from('product_photos')
          .upsert({
            user_id: user.id,
            product_number: photo.productNumber,
            barcode: photo.barcode,
            product_name: photo.name.replace(/\.\w+$/, ''), // Remove extensão
            photo_url: publicUrl,
            file_name: photo.file.name,
            file_size: photo.file.size
          }, {
            onConflict: 'user_id,product_number'
          });

        if (dbError) throw dbError;

        // Atualizar status
        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'success' } : p
        ));

        setProgress({ current: i + 1, total: photos.length });

      } catch (error) {
        console.error(`Erro ao fazer upload de ${photo.name}:`, error);
        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error', error: error.message } : p
        ));
      }
    }

    setUploading(false);
    loadUploadedPhotos();
  };

  const deletePhoto = async (photoId, photoUrl) => {
    try {
      // Extrair caminho do arquivo da URL
      const filePath = photoUrl.split('/product-photos/')[1];
      
      // Deletar do Storage
      await supabase.storage
        .from('product-photos')
        .remove([filePath]);

      // Deletar do banco
      const { error } = await supabase
        .from('product_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      loadUploadedPhotos();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      alert('Erro ao deletar foto: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">📸 Gerenciar Fotos dos Produtos</h2>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Fotos
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="mt-2 text-sm text-gray-500">
          💡 Nomeie as fotos como: <code>003_cafe_3c_500g.jpg</code> ou <code>7896045102426.jpg</code>
        </p>
      </div>

      {/* Preview Selected Photos */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Fotos Selecionadas ({photos.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {photos.map((photo, idx) => (
              <div key={idx} className="border rounded-lg p-2">
                <img 
                  src={photo.preview} 
                  alt={photo.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-xs truncate">{photo.name}</p>
                {photo.productNumber && (
                  <p className="text-xs text-green-600">#{photo.productNumber}</p>
                )}
                {photo.barcode && (
                  <p className="text-xs text-blue-600">{photo.barcode}</p>
                )}
                {photo.status === 'success' && (
                  <p className="text-xs text-green-600">✅ Enviado</p>
                )}
                {photo.status === 'error' && (
                  <p className="text-xs text-red-600">❌ Erro</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={uploadPhotos}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? `Enviando ${progress.current}/${progress.total}...` : 'Enviar Fotos'}
          </button>
        </div>
      )}

      {/* Uploaded Photos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Fotos Enviadas ({uploadedPhotos.length})
        </h3>
        {uploadedPhotos.length === 0 ? (
          <p className="text-gray-500">Nenhuma foto enviada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-lg p-2 relative group">
                <img 
                  src={photo.photo_url} 
                  alt={photo.product_name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-xs font-semibold">#{photo.product_number}</p>
                <p className="text-xs truncate text-gray-600">{photo.product_name}</p>
                {photo.barcode && (
                  <p className="text-xs text-blue-600">{photo.barcode}</p>
                )}
                <button
                  onClick={() => deletePhoto(photo.id, photo.photo_url)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploader;

