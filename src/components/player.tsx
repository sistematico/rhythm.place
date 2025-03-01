'use client'

import { useState, useRef, useEffect } from 'react'
import { Speaker, Play, Pause } from 'lucide-react'
import Image from 'next/image'
import '@/styles/range.scss'

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState('Carregando...')
  const [volume, setVolume] = useState(40)
  const [artistImage, setArtistImage] = useState('/images/ogp.png')
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [lastProcessedArtist, setLastProcessedArtist] = useState('')
  const [imageCache, setImageCache] = useState<Record<string, string>>({})

  const audioRef = useRef<HTMLAudioElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const MAX_VOLUME = 80

  const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY

  function togglePlayback() {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      updateSrcAndPlay()
    }
    setIsPlaying(!isPlaying)
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return

    const volumeValue = Number(e.target.value)
    setVolume(volumeValue)
    audioRef.current.volume = volumeValue / MAX_VOLUME

    if (rangeRef.current) {
      const progressPercentage = (volumeValue / MAX_VOLUME) * 100
      rangeRef.current.style.setProperty('--range-progress', `${progressPercentage}%`)
    }
  }

  function updateSrcAndPlay() {
    if (!audioRef.current) return

    const timestamp = Date.now()
    const newSrc = `https://radio.rhythm.place/rtp.mp3?nocache=${timestamp}`

    audioRef.current.src = newSrc
    audioRef.current.load()
    audioRef.current.play().catch((err) => console.error('Erro ao reproduzir áudio:', err))
  }

  async function fetchArtistImage(artistName: string) {
    if (!artistName) return

    // Verificar se já processamos este artista e já temos sua imagem em cache
    if (artistName === lastProcessedArtist) {
      return // Não buscar novamente se for o mesmo artista
    }

    // Verificar se temos a imagem em cache
    if (imageCache[artistName]) {
      setArtistImage(imageCache[artistName])
      setLastProcessedArtist(artistName)
      return
    }

    setIsLoadingImage(true)

    try {
      // Tentar primeiro com a API do iTunes que geralmente tem capas de álbuns melhores
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist,album&limit=1`
      const itunesResponse = await fetch(itunesUrl)

      if (itunesResponse.ok) {
        const itunesData = await itunesResponse.json()

        if (itunesData.results && itunesData.results.length > 0) {
          // Prefira a imagem do álbum se disponível, pois é geralmente melhor que a imagem do artista
          const result = itunesData.results[0]

          if (result.artworkUrl100) {
            // Obter versão maior da imagem (substituindo 100x100 por 600x600)
            const largerImage = result.artworkUrl100.replace('100x100', '600x600')
            setArtistImage(largerImage)
            setImageCache((prev) => ({ ...prev, [artistName]: largerImage }))
            setLastProcessedArtist(artistName)
            setIsLoadingImage(false)
            return
          }
        }
      }

      // Se o iTunes não retornar resultados, tentar com Last.fm
      const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erro ao buscar imagem: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.artist && data.artist.image && data.artist.image.length > 0) {
        // Pegar a imagem extralarge ou a maior disponível
        const extraLargeImage = data.artist.image.find((img: { size: string }) => img.size === 'extralarge')
        const largeImage = data.artist.image.find((img: { size: string }) => img.size === 'large')

        // Verificar se a imagem é um placeholder do Last.fm (tipicamente URLs vazias ou com placeholder)
        if (extraLargeImage && extraLargeImage['#text'] && !extraLargeImage['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) {
          setArtistImage(extraLargeImage['#text'])
          setImageCache((prev) => ({ ...prev, [artistName]: extraLargeImage['#text'] }))
          setLastProcessedArtist(artistName)
          return
        } else if (largeImage && largeImage['#text'] && !largeImage['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) {
          setArtistImage(largeImage['#text'])
          setImageCache((prev) => ({ ...prev, [artistName]: largeImage['#text'] }))
          setLastProcessedArtist(artistName)
          return
        }
      }

      // Caso não encontre a imagem, tenta buscar usando a Spotify API
      // Nota: Isso requeriria autenticação com a API do Spotify (não implementado aqui)

      // Caso não encontre em nenhuma API, mantém a imagem padrão
      setLastProcessedArtist(artistName)
      setArtistImage('/images/ogp.png')
      setImageCache((prev) => ({ ...prev, [artistName]: '/images/ogp.png' }))
    } catch (error) {
      console.error('Erro ao buscar imagem do artista:', error)
      setLastProcessedArtist(artistName)
      setArtistImage('/images/ogp.png')
      setImageCache((prev) => ({ ...prev, [artistName]: '/images/ogp.png' }))
    } finally {
      setIsLoadingImage(false)
    }
  }

  async function fetchCurrentSong() {
    try {
      const response = await fetch('https://radio.rhythm.place/json')
      if (!response.ok) throw new Error(`Erro: ${response.statusText}`)

      const {
        icestats: {
          source: { title }
        }
      } = await response.json()

      if (title && title !== currentSong) {
        setCurrentSong(title || 'Título não disponível')

        // Extrai o nome do artista da música
        const artistName = extractArtistName(title)
        if (artistName) {
          // Só busca uma nova imagem se o artista mudou
          const currentArtist = extractArtistName(currentSong)
          if (artistName !== currentArtist) {
            fetchArtistImage(artistName)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar a música atual:', error)
      setCurrentSong('Não foi possível carregar a música atual')
    }
  }

  // Função para extrair o nome do artista do título da música
  function extractArtistName(title: string) {
    if (!title) return null

    // Formato comum: "Artista - Nome da Música"
    const parts = title.split('-')
    if (parts.length >= 2) {
      // Limpa o nome do artista para melhorar a busca
      let artistName = parts[0].trim()

      // Remove textos como "feat.", "(feat", "ft." e similares para obter apenas o artista principal
      artistName = artistName.split(/\s+(?:feat|ft|featuring|with|&|,)\.?\s+/i)[0].trim()

      // Remove parênteses, colchetes ou chaves e seu conteúdo
      artistName = artistName.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim()

      return artistName
    }

    return null
  }

  useEffect(() => {
    if (rangeRef.current) {
      const progressPercentage = (volume / MAX_VOLUME) * 100
      rangeRef.current.style.setProperty('--range-progress', `${progressPercentage}%`)
    }

    fetchCurrentSong()
    const intervalId = setInterval(fetchCurrentSong, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex w-full max-w-md bg-zinc-800 border-zinc-900 rounded-lg shadow-md border-2 overflow-hidden">
      {/* Área da capa */}
      <div className="flex-shrink-0 w-[120px] h-[120px] relative">
        {isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-700">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-cyan-500 rounded-full"></div>
          </div>
        ) : artistImage.startsWith('/') ? (
          // Imagem local - usa Image normalmente
          <Image width={120} height={120} className="w-full h-full object-cover" src={artistImage} alt="Imagem do artista" onError={() => setArtistImage('/images/ogp.png')} />
        ) : (
          // Imagem remota - usa img padrão ou Image com unoptimized=true
          <Image width={120} height={120} className="w-full h-full object-cover" src={artistImage} alt="Imagem do artista" onError={() => setArtistImage('/images/ogp.png')} unoptimized={true} />
        )}
      </div>

      {/* Conteúdo e controles */}
      <div className="flex flex-col flex-grow justify-between p-3 w-0 min-w-0">
        {/* Título da música - Agora com truncamento correto */}
        <div className="w-full overflow-hidden">
          <p className="text-lg text-white truncate font-medium max-w-full whitespace-nowrap overflow-ellipsis">{currentSong}</p>
          {extractArtistName(currentSong) && <p className="text-sm text-gray-400 truncate max-w-full">Artista: {extractArtistName(currentSong)}</p>}
        </div>

        {/* Controles na parte inferior */}
        <div className="flex items-center justify-between mt-auto">
          {/* Play/Pause */}
          <button onClick={togglePlayback} type="button" className="flex items-center justify-center text-white p-1.5 hover:bg-cyan-600 transition-colors rounded-full">
            {!isPlaying ? <Play className="h-6 w-6" aria-hidden="true" /> : <Pause className="h-6 w-6" aria-hidden="true" />}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-x-2">
            <input ref={rangeRef} type="range" className="w-20 h-1.5 no-thumb-slider cursor-pointer rounded-xl" min={0} max={MAX_VOLUME} value={volume} onChange={handleVolumeChange} />
            <Speaker className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Elemento de áudio */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          updateSrcAndPlay()
        }}
      >
        <source type="audio/mpeg" />
        Seu navegador não suporta o elemento de áudio.
      </audio>
    </div>
  )
}