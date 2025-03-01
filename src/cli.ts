import { db } from '@/db'
import { songs } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function getRandomSong() {
  // Seleciona uma música aleatória
  const [song] = await db
    .select()
    .from(songs)
    .orderBy(sql`RANDOM()`)
    .limit(1)

  if (!song) {
    console.error('Nenhuma música encontrada no banco de dados.')
    return
  }

  console.log(`Música selecionada: ${song.title} - ${song.artist}`)

  // Envia a música para o Liquidsoap
  try {
    const command = `echo "avançar ${song.filePath}" | nc localhost 1234`
    await execAsync(command)
    console.log('Música enviada para o Liquidsoap com sucesso.')
  } catch (error) {
    console.error('Erro ao enviar a música para o Liquidsoap:', error)
  }

  // Gera um evento para recarregar informações da UI
  // Aqui você pode implementar a lógica para notificar a interface do usuário
  // sobre a mudança na música atual, por exemplo, utilizando WebSockets ou outra
  // tecnologia de comunicação em tempo real.
}

getRandomSong().catch(console.error)
