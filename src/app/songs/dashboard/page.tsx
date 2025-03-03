'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

// Tipos para os dados
type Song = {
  title: string
  artist: string
  album?: string
}

type UltimaTocada = Song & {
  pedidoId: number
  songId: number
  dispatchedAt: string
  filePath: string
}

type ProximoPedido = Song & {
  pedidoId: number
  songId: number
  createdAt: string
}

type MaisPedida = Song & {
  songId: number
  totalPedidos: number
}

export default function DashboardPage() {
  const [ultimasTocadas, setUltimasTocadas] = useState<UltimaTocada[]>([])
  const [proximosPedidos, setProximosPedidos] = useState<ProximoPedido[]>([])
  const [maisPedidas, setMaisPedidas] = useState<MaisPedida[]>([])
  const [loading, setLoading] = useState({
    historico: true,
    proximos: true,
    populares: true
  })
  const [error, setError] = useState({
    historico: '',
    proximos: '',
    populares: ''
  })

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Função para formatar nome da música
  const formatSongName = (song: Song) => {
    return `${song.title} - ${song.artist}${
      song.album ? ` (${song.album})` : ''
    }`
  }

  // Carregar dados do histórico
  useEffect(() => {
    async function fetchHistorico() {
      try {
        const response = await fetch('/api/historico')
        if (!response.ok) throw new Error('Falha ao carregar histórico')

        const data = await response.json()
        setUltimasTocadas(data.ultimasTocadas || [])
      } catch (error) {
        console.error('Erro:', error)
        setError((prev) => ({
          ...prev,
          historico: 'Erro ao carregar o histórico de músicas'
        }))
      } finally {
        setLoading((prev) => ({ ...prev, historico: false }))
      }
    }

    async function fetchProximos() {
      try {
        const response = await fetch('/api/proximos-pedidos')
        if (!response.ok) throw new Error('Falha ao carregar próximos pedidos')

        const data = await response.json()
        setProximosPedidos(data.proximosPedidos || [])
      } catch (error) {
        console.error('Erro:', error)
        setError((prev) => ({
          ...prev,
          proximos: 'Erro ao carregar próximos pedidos'
        }))
      } finally {
        setLoading((prev) => ({ ...prev, proximos: false }))
      }
    }

    async function fetchPopulares() {
      try {
        const response = await fetch('/api/mais-pedidas')
        if (!response.ok) throw new Error('Falha ao carregar músicas populares')

        const data = await response.json()
        setMaisPedidas(data.maisPedidas || [])
      } catch (error) {
        console.error('Erro:', error)
        setError((prev) => ({
          ...prev,
          populares: 'Erro ao carregar músicas mais pedidas'
        }))
      } finally {
        setLoading((prev) => ({ ...prev, populares: false }))
      }
    }

    fetchHistorico()
    fetchProximos()
    fetchPopulares()
  }, [])

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Dashboard do Sistema de Músicas
      </h1>

      <Tabs defaultValue="historico" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico">Últimas Tocadas</TabsTrigger>
          <TabsTrigger value="proximos">Próximos Pedidos</TabsTrigger>
          <TabsTrigger value="populares">Mais Pedidas</TabsTrigger>
        </TabsList>

        {/* Últimas Tocadas */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Últimas 10 Músicas Tocadas</CardTitle>
              <CardDescription>
                Histórico das músicas mais recentes que foram reproduzidas pelo
                sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.historico ? (
                <p className="text-center py-4">Carregando histórico...</p>
              ) : error.historico ? (
                <p className="text-red-500 text-center py-4">
                  {error.historico}
                </p>
              ) : ultimasTocadas.length === 0 ? (
                <p className="text-center py-4">
                  Nenhuma música foi tocada ainda.
                </p>
              ) : (
                <ul className="divide-y">
                  {ultimasTocadas.map((item) => (
                    <li
                      key={item.pedidoId}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{formatSongName(item)}</p>
                        <p className="text-sm text-gray-500">
                          Tocada em: {formatDate(item.dispatchedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Próximos Pedidos */}
        <TabsContent value="proximos">
          <Card>
            <CardHeader>
              <CardTitle>Próximos 10 Pedidos</CardTitle>
              <CardDescription>
                Fila de pedidos a serem reproduzidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.proximos ? (
                <p className="text-center py-4">
                  Carregando fila de pedidos...
                </p>
              ) : error.proximos ? (
                <p className="text-red-500 text-center py-4">
                  {error.proximos}
                </p>
              ) : proximosPedidos.length === 0 ? (
                <p className="text-center py-4">
                  Não há pedidos na fila no momento.
                </p>
              ) : (
                <ul className="divide-y">
                  {proximosPedidos.map((item, index) => (
                    <li
                      key={item.pedidoId}
                      className="py-3 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 mr-3 bg-indigo-100 text-indigo-800 rounded-full">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{formatSongName(item)}</p>
                          <p className="text-sm text-gray-500">
                            Pedido em: {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mais Pedidas */}
        <TabsContent value="populares">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Músicas Mais Pedidas</CardTitle>
              <CardDescription>
                Músicas mais populares com base no total de pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.populares ? (
                <p className="text-center py-4">
                  Carregando músicas populares...
                </p>
              ) : error.populares ? (
                <p className="text-red-500 text-center py-4">
                  {error.populares}
                </p>
              ) : maisPedidas.length === 0 ? (
                <p className="text-center py-4">
                  Ainda não há dados suficientes para gerar estatísticas.
                </p>
              ) : (
                <ul className="divide-y">
                  {maisPedidas.map((item) => (
                    <li
                      key={item.songId}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{formatSongName(item)}</p>
                      </div>
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {item.totalPedidos}{' '}
                        {item.totalPedidos === 1 ? 'pedido' : 'pedidos'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Link
          href="/requests"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Fazer Novo Pedido
        </Link>
      </div>
    </main>
  )
}
