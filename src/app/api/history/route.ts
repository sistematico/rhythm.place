import { NextResponse } from 'next/server'
import { db } from '@/db'
import { history, songs } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const ultimas = await db
      .select()
      .from(history)
      .innerJoin(songs, eq(history.songId, songs.id))
      .orderBy(desc(history.dispatchedAt))
      .limit(10)

    return NextResponse.json({ ultimas, total: ultimas.length })
  } catch (error) {
    console.error('Erro ao buscar últimas músicas tocadas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
