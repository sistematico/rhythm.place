// app/api/historico/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, songs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET() {
  try {
    const ultimasTocadas = await db
      .select({
        pedidoId: requests.id,
        songId: requests.songId,
        dispatchedAt: requests.dispatchedAt,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        filePath: songs.filePath
      })
      .from(requests)
      .innerJoin(songs, eq(requests.songId, songs.id))
      .where(and(
        eq(requests.dispatched, true),
        // Garantir que dispatchedAt não seja nulo
        // @ts-ignore - O TypeScript pode não entender completamente esta condição
        requests.dispatchedAt.isNotNull()
      ))
      .orderBy(desc(requests.dispatchedAt))
      .limit(10);

    return NextResponse.json({ 
      ultimasTocadas,
      total: ultimasTocadas.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar últimas músicas tocadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}