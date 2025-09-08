'use client';

import { useState, useEffect, useCallback } from 'react';

interface Download {
  id: number;
  videoUrl: string;
  videoTitle: string | null;
  videoAuthor: string | null;
  videoThumbnail: string | null;
  fileName: string | null;
  status: string;
  createdAt: string;
  error: string | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-gray-500',
    processing: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${colors[status] || 'bg-gray-500'}`}>
      {status.toUpperCase()}
    </span>
  );
};

const DownloadCard = ({ download }: { download: Download }) => (
  <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex gap-4">
      {download.videoThumbnail && (
        <img 
          src={download.videoThumbnail} 
          alt={download.videoTitle || 'Thumbnail'}
          className="w-24 h-24 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">
          {download.videoTitle || 'Processing...'}
        </h3>
        {download.videoAuthor && (
          <p className="text-sm text-gray-600">by {download.videoAuthor}</p>
        )}
        <p className="text-xs text-gray-400 truncate mt-1">
          {download.videoUrl}
        </p>
        {download.error && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ {download.error}
          </p>
        )}
        {download.status === 'completed' && download.fileName && (
          <button
            type="button"
            onClick={() => window.open(`/api/upload?file=${download.fileName}`, '_blank')}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            📥 Download MP3
          </button>
        )}
      </div>
      <StatusBadge status={download.status} />
    </div>
  </div>
);

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<Set<number>>(new Set());

  const fetchDownloads = useCallback(async () => {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
        
        // Identificar downloads ativos
        const active = new Set<number>(
          data
            .filter((d: Download) => d.status === 'processing' || d.status === 'pending')
            .map((d: Download) => d.id)
        );
        setActiveDownloads(active);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  }, []);

  const checkDownloadStatus = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/upload?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        
        setDownloads(prev => 
          prev.map(d => d.id === id ? data : d)
        );
        
        if (data.status === 'completed' || data.status === 'failed') {
          setActiveDownloads(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 5000);
    return () => clearInterval(interval);
  }, [fetchDownloads]);

  useEffect(() => {
    if (activeDownloads.size === 0) return;

    const interval = setInterval(() => {
      activeDownloads.forEach(id => { checkDownloadStatus(id); });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeDownloads, checkDownloadStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUrl('');
        setActiveDownloads(prev => new Set([...prev, data.downloadId]));
        await fetchDownloads();
      } else {
        alert(data.error || 'Failed to start download');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-8 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎵 YouTube to MP3
          </h1>
          <p className="text-gray-600">
            Download YouTube videos as high-quality MP3 files with metadata
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>⬇️</span>
                    Download MP3
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Recent Downloads
          </h2>
          
          {downloads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-xl">📭 No downloads yet</p>
              <p className="text-sm mt-2">Start by pasting a YouTube URL above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((download) => (
                <DownloadCard key={download.id} download={download} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}