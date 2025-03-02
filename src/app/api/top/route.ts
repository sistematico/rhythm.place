// app/api/mais-pedidas/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, songs } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Buscar as 10 músicas mais pedidas com contagem de pedidos
    const maisPedidas = await db
      .select({
        songId: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        // Contar quantas vezes esta música foi pedida
        totalPedidos: sql<number>`COUNT(${requests.id})::int`
      })
      .from(songs)
      .innerJoin(requests, eq(songs.id, requests.songId))
      .groupBy(songs.id, songs.title, songs.artist, songs.album)
      .orderBy(desc(sql`COUNT(${requests.id})`))
      .limit(10);

    return NextResponse.json({ 
      maisPedidas,
      total: maisPedidas.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar músicas mais pedidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}