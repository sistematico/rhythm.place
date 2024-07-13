import { Glob } from 'bun'

const genre = Bun.argv[2] || 'main';
const songsPath = Bun.env.SONGS_PATH;
if (!songsPath) throw new Error("SONGS_PATH not set");

async function randomFile(genre: string): Promise<string> {
  const files = []
  const scanPath = genre === 'main' || genre === '' ? `${songsPath}/**/*.mp3` : `${songsPath}/${genre}/**/*.mp3`

  const glob = new Glob(scanPath)

  for await (const file of glob.scan(songsPath)) {
    files.push(file)
  }

  return files[Math.floor(Math.random() * files.length)]
}

Bun.write(Bun.stdout, await randomFile(genre))
