import { readdir } from 'fs/promises'
import { join } from 'path'
import * as metadata from 'music-metadata'
import { db } from '@/db'
import { songs } from '@/db/schema'
import { eq } from 'drizzle-orm'

const AUDIO_FILES_BASE_PATH = process.env.AUDIO_FILES_PATH!

interface TrackInfo {
  filePath: string
  title?: string
  artist?: string
  album?: string
  duration?: number
  bitrate?: number
}

async function readMP3Files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, {
    recursive: true,
    encoding: 'utf-8'
  })

  return entries
    .filter((entry: string) => entry.endsWith('.mp3'))
    .map((entry: string) => join(dir, entry))
}

async function getAudioMetadata(filePath: string): Promise<TrackInfo> {
  try {
    const file = Bun.file(filePath)
    const { common: tags, format } = await metadata.parseWebStream(
      file.stream(),
      {
        mimeType: 'audio/mpeg',
        size: file.size
      }
    )

    return {
      filePath,
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      duration:
        typeof format.duration === 'number' ? Math.floor(format.duration) : 0,
      bitrate:
        typeof format.bitrate === 'number' ? Math.floor(format.bitrate) : 0
    }
  } catch (error) {
    console.error(`Error reading metadata for ${filePath}:`, error)
    return { filePath }
  }
}

async function main() {
  const mp3Files = await readMP3Files(AUDIO_FILES_BASE_PATH)

  if (mp3Files.length === 0) {
    console.log('⚠️ No MP3 files found.')
    return
  }

  const tracksData = await Promise.all(mp3Files.map(getAudioMetadata))

  for (const track of tracksData) {
    // Verifica se a música já existe no banco pelo filePath
    const [existingTrack] = await db
      .select()
      .from(songs)
      .where(eq(songs.filePath, track.filePath))
      .limit(1)

    if (existingTrack) {
      await db
        .update(songs)
        .set({
          title: track.title ?? existingTrack.title,
          artist: track.artist ?? existingTrack.artist,
          album: track.album ?? existingTrack.album,
          duration: track.duration ?? existingTrack.duration,
          bitrate: track.bitrate ?? existingTrack.bitrate
        })
        .where(eq(songs.filePath, track.filePath))
    } else {
      await db.insert(songs).values(track)
    }
  }

  console.log(`✅ Seed completed! Inserted/updated ${tracksData.length} tracks`)
}

main().catch(console.error)
