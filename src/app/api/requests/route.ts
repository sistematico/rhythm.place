// app/api/pedidos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { songs, requests } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Parse o corpo da requisição
    const body = await request.json()

    // Valide se songId foi fornecido
    if (!body.songId || typeof body.songId !== 'number') {
      return NextResponse.json(
        { error: 'É necessário fornecer um songId válido' },
        { status: 400 }
      )
    }

    // Verifique se a música existe
    const songExists = await db.query.songs.findFirst({
      where: eq(songs.id, body.songId)
    })

    if (!songExists) {
      return NextResponse.json(
        { error: 'Música não encontrada' },
        { status: 404 }
      )
    }

    // Crie o pedido
    const [novoPedido] = await db
      .insert(requests)
      .values({
        songId: body.songId,
        createdAt: new Date(),
        dispatched: false
      })
      .returning()

    return NextResponse.json(
      {
        message: 'Pedido criado com sucesso',
        pedido: {
          id: novoPedido.id,
          songId: novoPedido.songId,
          createdAt: novoPedido.createdAt
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao processar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint GET para listar músicas disponíveis (útil para a interface)
export async function GET() {
  try {
    // const songsList = await db.query.songs.findMany({
    //   select: {
    //     id: true,
    //     title: true,
    //     artist: true,
    //     album: true,
    //   },
    // });

    const songList = await db
      .select()
      .from(songs)
      .where(eq(songs.title, 'title'))
      .orderBy(asc(songs.id)) // order by is mandatory
      .limit(4) // the number of rows to return
      .offset(4) // the number of rows to skip

    return NextResponse.json({ songs: songList })
  } catch (error) {
    console.error('Erro ao buscar músicas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
