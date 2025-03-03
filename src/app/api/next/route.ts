import { NextResponse } from 'next/server'
import { db } from '@/db'
import { requests, songs } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const results = await db
      .select()
      .from(requests)
      .innerJoin(songs, eq(requests.songId, songs.id))
      .orderBy(desc(requests.dispatchedAt))
      .limit(10)

    return NextResponse.json({ requests: results, total: results.length })
  } catch (error) {
    console.error('Erro ao buscar últimas músicas tocadas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}