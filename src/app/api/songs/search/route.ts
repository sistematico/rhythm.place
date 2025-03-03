import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { songs } from '@/db/schema'
import { ilike, or, asc, SQL } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Extrair parâmetros da URL
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    
    // Extrair body da requisição
    const body = await request.json()
    const { title } = body
    
    // Definir valores padrão para limit e offset se não forem fornecidos
    // ou converter para number se forem fornecidos
    const limit = limitParam ? Number(limitParam) : 10
    const offset = offsetParam ? Number(offsetParam) : 0
    
    if (!title) {
      return NextResponse.json(
        {
          results: [],
          query: '',
          message: 'Parâmetro de pesquisa "title" é obrigatório'
        },
        { status: 400 }
      )
    }
    
    const searchSongs = async (filters: SQL[]) => {
      return await db
        .select()
        .from(songs)
        .where(or(...filters))
        .orderBy(asc(songs.artist), asc(songs.title))
        .limit(limit)
        .offset(offset)
    } 
    const filters: SQL[] = []    
    filters.push(ilike(songs.artist, `%${title}%`))
    filters.push(ilike(songs.title, `%${title}%`))
    
    const results = await searchSongs(filters)

    
    // Retornar resultados
    return NextResponse.json({
      results,
      query: title,
      pagination: {
        limit: limit,
        offset: offset,
        total: results.length
      },
      message: `Encontrados ${results.length} resultados para "${title}"`
    })
  } catch (error) {
    console.error('Erro ao processar a requisição:', error)
    return NextResponse.json(
      {
        results: [],
        query: '',
        message: 'Erro ao processar a requisição'
      },
      { status: 500 }
    )
  }
}