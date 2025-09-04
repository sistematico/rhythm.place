"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  streamUrl: string;
  metadataUrl?: string;
}

interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  coverArt?: string;
}

export function Player({
  streamUrl,
  metadataUrl,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolume = useRef(volume);

  // Buscar metadados do stream Icecast
  const fetchMetadata = useCallback(async () => {
    if (!metadataUrl) return;

    try {
      const response = await fetch(metadataUrl);
      const data = await response.json();

      if (data && (data.title || data.artist)) {
        setMetadata({
          title: data.title || "Título desconhecido",
          artist: data.artist || "Artista desconhecido",
          album: data.album,
          coverArt: data.coverArt || "/default-cover.jpg",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar metadados:", err);
      setMetadata({
        title: "Transmissão ao vivo",
        artist: "Estação Icecast",
        coverArt: "/default-cover.jpg",
      });
    }
  }, [metadataUrl]);

  // Controles de áudio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          setError("Falha ao reproduzir: " + err.message);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current;
        setVolume(previousVolume.current);
      } else {
        previousVolume.current = volume;
        audioRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const refreshStream = () => {
    setIsLoading(true);
    fetchMetadata();

    // Recarregar o áudio
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }

    setTimeout(() => setIsLoading(false), 1000);
  };

  // Efeitos
  useEffect(() => {
    fetchMetadata();

    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => setIsLoading(false);
    const handleError = () => setError("Erro ao carregar o stream de áudio");
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    // Poll para atualizar metadados periodicamente
    const metadataInterval = setInterval(fetchMetadata, 30000);

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      clearInterval(metadataInterval);
    };
  }, [fetchMetadata]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 w-80 border border-gray-200/50">
      {/* Áudio element */}
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="metadata"
      />


      {/* Conteúdo do player */}
      <div className="flex items-center space-x-4">
        {/* Capa do álbum */}
        <div className="relative">
          <div className="w-16 h-16 rounded-lg shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
            {metadata?.coverArt ? (
              <img
                src={metadata.coverArt}
                alt={metadata.album || "Capa do álbum"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Informações da faixa */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {metadata?.title || "Carregando..."}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {metadata?.artist || "Estação Icecast"}
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3 mt-1">
            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>

            <button
              type="button"
              onClick={refreshStream}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full disabled:opacity-50"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full"
              >
                {isMuted || volume === 0 ? (
                  <MuteIcon className="w-4 h-4" />
                ) : volume > 0.5 ? (
                  <VolumeHighIcon className="w-4 h-4" />
                ) : (
                  <VolumeLowIcon className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 accent-gray-700 bg-gray-300 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 py-1 px-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
      clipRule="evenodd"
    />
  </svg>
);

const VolumeHighIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
      clipRule="evenodd"
    />
  </svg>
);

const VolumeLowIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0A4.984 4.984 0 0115 10a4.984 4.984 0 01-1.293 3.707 1 1 0 01-1.414-1.414A2.984 2.984 0 0013 10a2.984 2.984 0 00-.707-2.293 1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const MuteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <title>Mute</title>
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);
