"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Radio, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  streamUrl: string;
  metadataUrl?: string;
}

interface TrackMetadata {
  title: string;
  artist: string;
}

export function Player({ streamUrl, metadataUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState<TrackMetadata>({
    title: "Rhythm Place",
    artist: "Música para todas as tribos"
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar interval ao desmontar
  useEffect(() => {
    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  // Buscar metadados
  const fetchMetadata = useCallback(async () => {
    if (!metadataUrl) return;

    try {
      const response = await fetch(metadataUrl, { cache: "no-cache" });
      if (!response.ok) return;

      const data = await response.json();
      if (data?.title || data?.artist) {
        setMetadata({
          title: data.title || "Transmissão ao vivo",
          artist: data.artist || "Rhythm Place",
        });
      }
    } catch {
      // Silenciosamente mantém os metadados atuais
    }
  }, [metadataUrl]);

  // Toggle Play/Pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      try {
        // Força recarregar o stream
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Erro ao tocar:", error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isPlaying]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Ajustar volume
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Event handlers do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Atualizar metadados periodicamente quando tocando
  useEffect(() => {
    if (isPlaying) {
      fetchMetadata();
      metadataIntervalRef.current = setInterval(fetchMetadata, 30000);
    } else {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    }

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, [isPlaying, fetchMetadata]);

  // Definir volume inicial
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 w-full max-w-sm border border-gray-200/50">
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* Layout fixo para evitar shift */}
      <div className="space-y-4">
        {/* Header com ícone e metadados */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
            <Radio className={`w-7 h-7 ${isPlaying ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900 truncate">
              {metadata.title}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {metadata.artist}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-wait transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 accent-gray-700 bg-gray-300 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Status simples */}
        <div className="text-center">
          <span className={`text-xs ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
            {isLoading ? 'Conectando...' : isPlaying ? '● Ao vivo' : 'Clique para ouvir'}
          </span>
        </div>
      </div>
    </div>
  );
}