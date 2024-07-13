import { Glob } from 'bun'

const SONGS = Bun.env.SONGS_PATH

async function getRandomFile(genre: string): Promise<string> {
  const files = []
  let songsPath: string

  if (genre === '/' || genre === '') songsPath = `${SONGS}/principal`
  else songsPath = `${SONGS}${genre}`

  const glob = new Glob(`${songsPath}/**/*.mp3`)
  for await (const file of glob.scan(songsPath)) {
    files.push(file)
  }

  const index = Math.floor(Math.random() * files.length)
  return files[index]
}

const server = Bun.serve({
  port: 4444,
  async fetch (req) {
    const path = new URL(req.url).pathname
    
    if (path === '/' || path === '/dance' || path === '/rock' || path === '/70s' || path === '/80s' || path === '/90s') {
      const song = await getRandomFile(path)    
      return new Response(song)
    }
    
    return new Response("Page not found", { status: 404 })
  }
})

console.log(`Listening on ${server.url}`)
