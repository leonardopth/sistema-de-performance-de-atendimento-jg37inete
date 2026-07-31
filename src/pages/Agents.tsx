import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getAgents } from '@/services/agents'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { AgentTable } from '@/components/dashboard/AgentTable'
import { Search } from 'lucide-react'
import type { Agent } from '@/types'

export default function AgentsPage() {
  const { data, loading, error, reload } = useAsyncData<Agent[]>(() => getAgents())
  useRealtime('agents', () => reload())
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase()
    return data.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        ((a.expand?.team_id as { name?: string })?.name || '').toLowerCase().includes(q),
    )
  }, [data, search])

  if (loading) return <LoadingState message="Carregando agentes..." />
  if (error || !data) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} agentes cadastrados</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar agente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum agente encontrado.
            </p>
          ) : (
            <AgentTable agents={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
