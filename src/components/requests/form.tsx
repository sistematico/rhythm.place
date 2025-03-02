// components/PedidoForm.tsx
'use client';

import { useState, useEffect } from 'react';

type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
};

export default function PedidoForm() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<number | ''>('');
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'idle';
  }>({ message: '', type: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar lista de músicas disponíveis
  useEffect(() => {
    async function fetchSongs() {
      try {
        const response = await fetch('/api/requests');
        if (!response.ok) throw new Error('Falha ao carregar músicas');
        
        const data = await response.json();
        setSongs(data.songs || []);
      } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        setStatus({
          message: 'Não foi possível carregar a lista de músicas',
          type: 'error'
        });
      }
    }

    fetchSongs();
  }, []);

  // Manipular envio do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedSongId) {
      setStatus({
        message: 'Por favor, selecione uma música',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: '', type: 'idle' });

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: Number(selectedSongId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer pedido');
      }

      setStatus({
        message: 'Pedido realizado com sucesso!',
        type: 'success'
      });
      
      // Limpar seleção após pedido bem-sucedido
      setSelectedSongId('');
      
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      setStatus({
        message: error instanceof Error ? error.message : 'Erro ao fazer pedido',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Faça seu Pedido de Música</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="song-select" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione uma música:
          </label>
          
          <select
            id="song-select"
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="">-- Selecione uma música --</option>
            {songs.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title} - {song.artist} {song.album ? `(${song.album})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !selectedSongId}
          className={`w-full py-2 px-4 rounded-md text-white font-medium 
            ${isLoading || !selectedSongId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {isLoading ? 'Enviando...' : 'Fazer Pedido'}
        </button>
      </form>
      
      {status.message && (
        <div className={`mt-4 p-3 rounded ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 
          status.type === 'error' ? 'bg-red-100 text-red-800' : ''
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
}