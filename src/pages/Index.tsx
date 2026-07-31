import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getAgents } from '@/services/agents'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { StatCard } from '@/components/dashboard/StatCard'
import { ConversionChart } from '@/components/dashboard/ConversionChart'
import { TeamChart } from '@/components/dashboard/TeamChart'
import { TopPerformers } from '@/components/dashboard/TopPerformers'
import { AgentTable } from '@/components/dashboard/AgentTable'
import { MessageSquare, Percent, Clock, Star } from 'lucide-react'
import type { Agent } from '@/types'

const trendData = [
  { month: 'Jan', conversions: 42, total: 120 },
  { month: 'Fev', conversions: 51, total: 135 },
  { month: 'Mar', conversions: 38, total: 110 },
  { month: 'Abr', conversions: 67, total: 155 },
  { month: 'Mai', conversions: 73, total: 168 },
  { month: 'Jun', conversions: 81, total: 180 },
]

export default function Index() {
  const { data: agents, loading, error, reload } = useAsyncData<Agent[]>(() => getAgents())
  useRealtime('agents', () => reload())

  const stats = useMemo(() => {
    if (!agents || agents.length === 0) return null
    const totalConv = agents.reduce((s, a) => s + a.total_conversations, 0)
    const avgConv = agents.reduce((s, a) => s + a.conversion_rate, 0) / agents.length
    const avgResp = agents.reduce((s, a) => s + a.avg_response_time, 0) / agents.length
    const avgSat = agents.reduce((s, a) => s + a.satisfaction_score, 0) / agents.length
    return { totalConv, avgConv, avgResp, avgSat }
  }, [agents])

  const topPerformers = useMemo(
    () =>
      agents ? [...agents].sort((a, b) => b.conversion_rate - a.conversion_rate).slice(0, 5) : [],
    [agents],
  )

  const teamData = useMemo(() => {
    if (!agents) return []
    const map = new Map<string, number>()
    agents.forEach((a) => {
      const name = (a.expand?.team_id as { name?: string })?.name || 'Sem equipe'
      map.set(name, (map.get(name) || 0) + a.total_conversations)
    })
    return Array.from(map, ([name, conversations]) => ({ name, conversations }))
  }, [agents])

  if (loading) return <LoadingState message="Carregando dashboard..." />
  if (error || !agents || !stats) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da performance da equipe de atendimento
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Conversas"
          value={stats.totalConv.toLocaleString('pt-BR')}
          icon={MessageSquare}
          trend={12.5}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.avgConv.toFixed(1)}%`}
          icon={Percent}
          trend={3.2}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Tempo Médio Resposta"
          value={`${Math.round(stats.avgResp)}s`}
          icon={Clock}
          trend={-8.1}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Satisfação Média"
          value={stats.avgSat.toFixed(1)}
          icon={Star}
          trend={2.4}
          trendLabel="vs mês anterior"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendência de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionChart data={trendData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance por Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamChart data={teamData} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPerformers agents={topPerformers} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tabela de Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentTable agents={agents} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
