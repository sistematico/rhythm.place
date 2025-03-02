import { db } from '@/db'
import { songs, requests } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

async function validateFile(path: string) {
  const file = Bun.file(path)
  return await file.exists()
}

async function getRandomSong() {
  const [song] = await db
    .select()
    .from(songs)
    .orderBy(sql`RANDOM()`)
    .limit(1)
  
  if (!song)
    throw new Error('Nenhuma música encontrada no banco de dados')
  
  return song
}

async function getPendingRequest() {
  const [pendingRequests] = await db
    .select({
      id: requests.id,
      songId: requests.songId,
      createdAt: requests.createdAt
    })
    .from(requests)
    .where(eq(requests.dispatched, false))
    .orderBy(requests.createdAt)
    .limit(1)

  if (!pendingRequests) return null
  
  const [song] = await db
    .select()
    .from(songs)
    .where(eq(songs.id, requests.songId))
  
  if (!song) throw new Error(`Música com ID ${requests.songId} não encontrada`)
  
  return { id: requests.id, song }
}

async function markRequestAsDispatched(requestId: number) {
  await db
    .update(requests)
    .set({
      dispatched: true,
      dispatchedAt: new Date()
    })
    .where(eq(requests.id, requestId))
}

async function pickSong() {
  // Verificar se há pedidos pendentes
  const pendingRequests = await getPendingRequest()

  if (pendingRequests) {
    const { id, song } = pendingRequests
    
    if (!await validateFile(song.filePath))
      throw new Error(`Arquivo do pedido não encontrado: ${song.filePath}`)
    
    await markRequestAsDispatched(Number(id))
    
    return song.filePath
  }
  
  const song = await getRandomSong()
  
  if (!await validateFile(song.filePath))
    throw new Error(`Arquivo não encontrado: ${song.filePath}`)
  
  return song.filePath
}

pickSong()
  .then(song => Bun.write(Bun.stdout, song))
  .catch(console.error)
  .finally(() => process.exit(0))