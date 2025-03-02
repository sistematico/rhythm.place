import { db } from '@/db'
import { songs } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { exec } from 'child_process'
import { promisify } from 'util'
import { access } from 'fs/promises'
import { constants } from 'fs'

const execAsync = promisify(exec)

// Configurações
const LIQUIDSOAP_SOCKET = '/tmp/liquidsoap.sock' // Socket UNIX
const LIQUIDSOAP_COMMAND = 'dynamic.add' // Deve corresponder ao comando registrado no Liquidsoap

async function validateFile(path: string) {
  try {
    await access(path, constants.R_OK)
    return true
  } catch {
    return false
  }
}

async function sendToLiquidsoap(filePath: string) {
  try {
    const command = `echo '${LIQUIDSOAP_COMMAND} ${filePath}' | nc ${LIQUIDSOAP_SOCKET}`
    await execAsync(command)
    return true
  } catch (error) {
    console.error('Falha na comunicação com Liquidsoap:', error)
    return false
  }
}

async function getRandomSong() {
  try {
    const [song] = await db
      .select()
      .from(songs)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (!song) {
      throw new Error('Nenhuma música encontrada no banco de dados')
    }

    console.log(`Selecionada: ${song.title} - ${song.artist}`)

    // Validação do arquivo
    const fileExists = await validateFile(song.filePath)
    if (!fileExists) {
      throw new Error(`Arquivo não encontrado: ${song.filePath}`)
    }

    // Envio para Liquidsoap
    const success = await sendToLiquidsoap(song.filePath)
    
    if (success) {
      console.log('Música enviada com sucesso')
      // Implementar notificação UI aqui
      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro no processo:', error)
    return false
  }
}

// Executar como módulo independente
if (require.main === module) {
  getRandomSong().catch(console.error)
}