import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getConversations } from '@/services/conversations'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Conversation, Agent } from '@/types'

interface PaginatedResult {
  items: Conversation[]
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  open: 'default',
  closed: 'secondary',
  lost: 'destructive',
}
const channelLabel: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  chat: 'Chat',
  phone: 'Telefone',
}
const outcomeLabel: Record<string, string> = {
  converted: 'Convertido',
  not_converted: 'Não convertido',
  pending: 'Pendente',
}

export default function ConversationsPage() {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useAsyncData<PaginatedResult>(
    () => getConversations(page),
    [page],
  )
  useRealtime('conversations', () => reload())

  if (loading) return <LoadingState message="Carregando conversas..." />
  if (error || !data) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversas</h1>
        <p className="text-sm text-muted-foreground">{data.totalItems} conversas registradas</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Satisfação</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((conv) => {
                  const agent = conv.expand?.agent_id as Agent | undefined
                  return (
                    <TableRow key={conv.id}>
                      <TableCell className="font-medium">{conv.customer_name}</TableCell>
                      <TableCell className="text-muted-foreground">{agent?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {channelLabel[conv.channel] || conv.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[conv.status] || 'secondary'}>
                          {conv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {outcomeLabel[conv.outcome] || conv.outcome}
                      </TableCell>
                      <TableCell className="text-right">
                        {conv.satisfaction?.toFixed(1) || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {conv.duration}s
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Página {data.page} de {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
