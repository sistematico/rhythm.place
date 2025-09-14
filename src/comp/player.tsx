"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Play, Pause, Radio } from "lucide-react";

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

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function Player({ streamUrl, metadataUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [retryCount, setRetryCount] = useState(0);
  const [isUserInitiated, setIsUserInitiated] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolume = useRef(volume);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  // Buscar metadados do stream Icecast
  const fetchMetadata = useCallback(async () => {
    if (!metadataUrl) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout de 5s

      const response = await fetch(metadataUrl, {
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data && (data.title || data.artist)) {
        setMetadata({
          title: data.title || "Transmissão ao vivo",
          artist: data.artist || "Rhythm Place",
          album: data.album,
          coverArt: data.coverArt,
        });
      }
    } catch (err) {
      // Silenciosamente falha nos metadados, mantém os últimos conhecidos
      console.debug("Metadados indisponíveis:", err);

      // Se nunca tivemos metadados, define padrão
      if (!metadata) {
        setMetadata({
          title: "Rhythm Place",
          artist: "Música para todas as tribos",
          coverArt: undefined,
        });
      }
    }
  }, [metadataUrl, metadata]);

  // Função para tentar conectar ao stream
  // const attemptConnection = useCallback(async () => {
  //   if (!audioRef.current || !isUserInitiated) return;

  //   setConnectionStatus("connecting");

  //   try {
  //     // Testa se o stream está acessível
  //     const controller = new AbortController();
  //     const timeoutId = setTimeout(() => controller.abort(), 10000); // timeout de 10s

  //     const response = await fetch(streamUrl, {
  //       method: "HEAD",
  //       signal: controller.signal,
  //       cache: "no-cache",
  //     });

  //     clearTimeout(timeoutId);

  //     if (!response.ok) throw new Error(`Stream offline: ${response.status}`);

  //     // Stream disponível, tenta reproduzir
  //     audioRef.current.load();

  //     const playPromise = audioRef.current.play();

  //     if (playPromise !== undefined) {
  //       playPromise
  //         .then(() => {
  //           setConnectionStatus("connected");
  //           setIsPlaying(true);
  //           setRetryCount(0);
  //         })
  //         .catch((error) => {
  //           console.debug("Erro ao reproduzir:", error);
  //           setConnectionStatus("disconnected");
  //           setIsPlaying(false);
  //         });
  //     }
  //   } catch (error) {
  //     console.debug("Stream indisponível:", error);
  //     setConnectionStatus("error");
  //     setIsPlaying(false);

  //     // Retry automático com backoff exponencial
  //     if (retryCount < 5 && isUserInitiated) {
  //       const delay = Math.min(1000 * 2 ** retryCount, 30000); // max 30s
  //       setRetryCount((prev) => prev + 1);

  //       retryTimeoutRef.current = setTimeout(() => {
  //         attemptConnection();
  //       }, delay);
  //     }
  //   }
  // }, [streamUrl, retryCount, isUserInitiated]);
  const attemptConnection = useCallback(async () => {
    if (!audioRef.current || !isUserInitiated) return;

    setConnectionStatus("connecting");

    try {
      // Remove a verificação do fetch e vai direto para o play
      audioRef.current.load();

      await audioRef.current.play();
      setConnectionStatus("connected");
      setIsPlaying(true);
      setRetryCount(0);
    } catch (error) {
      console.error("Erro ao reproduzir:", error);

      // Se for erro de autoplay, mostra como desconectado
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name?: string }).name === "NotAllowedError"
      ) {
        setConnectionStatus("disconnected");
        setIsPlaying(false);
        alert("Por favor, clique no botão play para iniciar a reprodução");
      } else {
        setConnectionStatus("error");
        setIsPlaying(false);

        // Retry automático
        if (retryCount < 5 && isUserInitiated) {
          const delay = Math.min(1000 * 2 ** retryCount, 30000);
          setRetryCount((prev) => prev + 1);

          retryTimeoutRef.current = setTimeout(() => {
            attemptConnection();
          }, delay);
        }
      }
    }
  }, [retryCount, isUserInitiated]);

  // Controles de áudio
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsUserInitiated(false);
      setConnectionStatus("disconnected");

      // Cancela retry se estiver pausando
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    } else {
      setIsUserInitiated(true);
      setRetryCount(0);
      attemptConnection();
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
    setRetryCount(0);
    setIsUserInitiated(true);
    attemptConnection();
    fetchMetadata();
  };

  // Event handlers para o elemento de áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      if (isUserInitiated) {
        setConnectionStatus("connected");
      }
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;

      // Suprime logs de erro do console
      e.preventDefault();
      e.stopPropagation();

      console.debug("Erro de áudio:", error?.code, error?.message);

      if (isUserInitiated) {
        setConnectionStatus("error");

        // Tenta reconectar automaticamente
        if (retryCount < 5) {
          const delay = Math.min(1000 * 2 ** retryCount, 30000);
          setRetryCount((prev) => prev + 1);

          retryTimeoutRef.current = setTimeout(() => {
            attemptConnection();
          }, delay);
        }
      }
    };

    const handleStalled = () => {
      console.debug("Stream travado");
      if (isUserInitiated && connectionStatus === "connected") {
        setConnectionStatus("connecting");
      }
    };

    const handleWaiting = () => {
      console.debug("Aguardando dados...");
      if (isUserInitiated) {
        setConnectionStatus("connecting");
      }
    };

    const handlePlaying = () => {
      setConnectionStatus("connected");
      setIsPlaying(true);
      setRetryCount(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setConnectionStatus("disconnected");

      // Para streams, "ended" geralmente significa desconexão
      if (isUserInitiated) {
        attemptConnection();
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError, true);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError, true);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isUserInitiated, connectionStatus, retryCount, attemptConnection]);

  // Poll para metadados quando conectado
  useEffect(() => {
    if (connectionStatus === "connected") {
      fetchMetadata();

      // Atualiza metadados a cada 30 segundos
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
  }, [connectionStatus, fetchMetadata]);

  // Status visual baseado na conexão
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500 animate-pulse";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Ao vivo";
      case "connecting":
        return `Conectando${retryCount > 0 ? ` (tentativa ${retryCount}/5)` : "..."}`;
      case "error":
        return "Fora do ar";
      default:
        return "Clique para ouvir";
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 w-80 border border-gray-200/50">
      {/* Áudio element com tratamento de erro silencioso */}
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="none"
        crossOrigin="anonymous"
      >
        {/* Placeholder track for accessibility compliance */}
        <track
          kind="captions"
          srcLang="en"
          label="No captions available"
          default
        />
      </audio>

      {/* Conteúdo do player */}
      <div className="flex items-center space-x-4">
        {/* Capa do álbum */}
        <div className="relative">
          <div className="w-16 h-16 rounded-lg shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
            {metadata?.coverArt ? (
              <img
                src={metadata.coverArt}
                alt={metadata.album || "Capa"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Radio className={`w-8 h-8 ${getStatusColor()}`} />
              </div>
            )}
          </div>

          {connectionStatus === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Informações da faixa */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {metadata?.title || "Rhythm Place"}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {metadata?.artist || "Música para todas as tribos"}
          </div>

          {/* Status da conexão */}
          <div className={`text-xs mt-0.5 ${getStatusColor()}`}>
            {getStatusText()}
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3 mt-1">
            <button
              type="button"
              onClick={togglePlay}
              disabled={connectionStatus === "connecting"}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>

            {connectionStatus === "error" && (
              <button
                type="button"
                onClick={refreshStream}
                className="p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full transition-all"
                title="Tentar novamente"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full transition-all"
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

      {/* Mensagem de erro amigável */}
      {connectionStatus === "error" && retryCount >= 5 && (
        <div className="mt-3 text-xs text-gray-600 bg-gray-50 py-1.5 px-2 rounded-lg flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>A rádio está temporariamente fora do ar</span>
        </div>
      )}
    </div>
  );
}

// Ícones auxiliares
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
