'use client'

import type React from 'react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RefreshCcw } from 'lucide-react'
import '@/styles/range.scss'

export default function WebRadio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)

  const currentSong = {
    title: 'Rhythm Place',
    artist: 'rhythm of all tribes',
    cover: '/images/ogp.png'
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current || !rangeRef.current) return

    const volumeValue = Number(e.target.value)
    setVolume(volumeValue)
    audioRef.current.volume = volumeValue / 100

    if (volumeValue === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }

    const progressPercentage = (volumeValue / 100) * 100
    rangeRef.current.style.setProperty(
      '--range-progress',
      `${progressPercentage}%`
    )
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  return (
    <>
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row gap-x-2 gap-y-6 items-center">
          {/* Album Cover */}
          <div className="w-48 h-48 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            <Image
              src={currentSong.cover || '/images/ogp.png'}
              alt={process.env.NEXT_PUBLIC_APP_NAME!}
              className="w-full h-full object-cover"
              width={400}
              height={400}
            />
          </div>
          {/* Controls and Info */}
          <div className="flex-1 w-full p-2">
            <div className="mb-4 text-center md:text-left">
              <h2 className="text-xl font-bold text-white">
                {currentSong.title}
              </h2>
              <p className="text-gray-400">{currentSong.artist}</p>
            </div>
            {/* Play/Pause Button */}
            <div className="flex justify-center md:justify-start mb-6">
              <button
                onClick={togglePlay}
                className="bg-zinc-700 p-3 rounded-md hover:bg-purple-600 transition-all duration-500 border-2 border-zinc-900 mr-2"
              >
                {isPlaying ? (
                  <Pause className="text-white" size={24} />
                ) : (
                  <Play className="text-white" size={24} />
                )}
              </button>
              <button
                onClick={togglePlay}
                className="bg-zinc-700 p-3 rounded-md hover:bg-purple-600 transition-all duration-500 border-2 border-zinc-900"
              >
                <RefreshCcw className="text-white hover:animate-spin" size={24} />
              </button>
            </div>
            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-gray-300 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <input
                ref={rangeRef}
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-lg no-thumb-slider cursor-pointer"
              />
              <span className="text-gray-400 text-sm w-10">{volume}%</span>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
      <audio
        ref={audioRef}
        src="https://radio.rhythm.place/main" // Replace with your actual stream URL
        className="hidden"
      />
    </>
  )
}
