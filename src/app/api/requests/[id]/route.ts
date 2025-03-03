import { NextResponse } from 'next/server'

export async function GET({ params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, message: `Requisição ${params.id} encontrada` })
}