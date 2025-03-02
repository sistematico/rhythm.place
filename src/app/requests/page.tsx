// app/pedidos/page.tsx
import PedidoForm from '@/components/requests/form'

export const metadata = {
  title: 'Faça seu Pedido de Música',
  description: 'Solicite suas músicas favoritas para tocar no sistema'
}

export default function RequestsPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Sistema de Pedidos de Música
      </h1>

      <div className="max-w-2xl mx-auto">
        <PedidoForm />

        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Como funciona:</h3>
          <p className="text-gray-700">
            Selecione sua música favorita na lista e faça seu pedido. Nosso
            sistema processará os pedidos em ordem de chegada. Se não houver
            pedidos pendentes, o sistema selecionará músicas aleatórias.
          </p>
        </div>
      </div>
    </main>
  )
}
