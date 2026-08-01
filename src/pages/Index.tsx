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
import { DateRangeExport } from '@/components/dashboard/DateRangeExport'
import { downloadCSV } from '@/lib/export-utils'
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

  const handleCSVExport = (startDate: string, endDate: string) => {
    const rows: (string | number)[][] = [
      ['Relatório de Performance'],
      [`Período: ${startDate} a ${endDate}`],
      [],
      ['Agente', 'Equipe', 'Conversas', 'Conversão (%)', 'Tempo Resposta (s)', 'Satisfação'],
      ...agents.map((a) => [
        a.name,
        (a.expand?.team_id as { name?: string })?.name || 'Sem equipe',
        a.total_conversations,
        a.conversion_rate,
        a.avg_response_time,
        a.satisfaction_score,
      ]),
    ]
    downloadCSV(`performance_${startDate}_${endDate}`, rows)
  }

  const handlePDFExport = (startDate: string, endDate: string) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>Relatório de Performance</title></head><body>
      <h1>Relatório de Performance</h1>
      <p>Período: ${startDate} a ${endDate}</p>
      <table border="1" cellpadding="5" cellspacing="0"><thead><tr>
      <th>Agente</th><th>Equipe</th><th>Conversas</th><th>Conversão (%)</th><th>Tempo Resposta (s)</th><th>Satisfação</th>
      </tr></thead><tbody>
      ${agents
        .map(
          (a) =>
            `<tr><td>${a.name}</td><td>${(a.expand?.team_id as { name?: string })?.name || 'Sem equipe'}</td><td>${a.total_conversations}</td><td>${a.conversion_rate}</td><td>${a.avg_response_time}</td><td>${a.satisfaction_score}</td></tr>`,
        )
        .join('')}
      </tbody></table></body></html>`)
    w.document.close()
    w.print()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da performance da equipe de atendimento
          </p>
        </div>
        <DateRangeExport onCSV={handleCSVExport} onPDF={handlePDFExport} />
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
