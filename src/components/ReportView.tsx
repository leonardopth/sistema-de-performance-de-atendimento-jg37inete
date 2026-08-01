import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Report } from '@/types'

function parseSummary(report: Report): Record<string, unknown> {
  if (typeof report.summary_data === 'string') {
    try {
      return JSON.parse(report.summary_data)
    } catch {
      return {}
    }
  }
  return (report.summary_data as Record<string, unknown>) || {}
}

const barConfig = {
  conversations: { label: 'Conversas', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig
const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']

function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

export function ReportView({ report }: { report: Report }) {
  const summary = parseSummary(report)
  const isAgentReport = !!report.agent || !!summary.agent_kpis

  if (isAgentReport) {
    const kpis = summary.agent_kpis as Record<string, number | string> | undefined
    const convSummary = summary.conversation_summary as Record<string, number> | undefined
    const evaluations = summary.recent_evaluations as Array<Record<string, unknown>> | undefined
    const achievements = summary.achievements as Array<Record<string, unknown>> | undefined
    const goalProgress = summary.goal_progress as Array<Record<string, unknown>> | undefined

    const outcomeData = convSummary
      ? [
          { name: 'Convertidas', value: convSummary.converted || 0 },
          { name: 'Não Convertidas', value: convSummary.not_converted || 0 },
          { name: 'Pendentes', value: convSummary.pending || 0 },
        ].filter((d) => d.value > 0)
      : []

    return (
      <div className="max-h-[65vh] space-y-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground">
          Período: {new Date(report.period_start).toLocaleDateString('pt-BR')} —{' '}
          {new Date(report.period_end).toLocaleDateString('pt-BR')}
        </p>
        {kpis && (
          <div className="grid grid-cols-2 gap-2">
            <KPICard label="Conversas" value={String(kpis.total_conversations ?? '—')} />
            <KPICard label="Conversão" value={`${Number(kpis.conversion_rate ?? 0).toFixed(1)}%`} />
            <KPICard label="Tempo Resposta" value={`${kpis.avg_response_time ?? '—'}s`} />
            <KPICard label="Satisfação" value={Number(kpis.satisfaction_score ?? 0).toFixed(1)} />
          </div>
        )}
        {outcomeData.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Conversas por Resultado</h4>
            <ChartContainer config={barConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={outcomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                >
                  {outcomeData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        )}
        {goalProgress && goalProgress.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Progresso das Metas</h4>
            <div className="space-y-2">
              {goalProgress.map((g, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{String(g.title)}</span>
                    <span className="text-muted-foreground">
                      {Number(g.current).toFixed(0)}/{Number(g.target).toFixed(0)}
                    </span>
                  </div>
                  <Progress value={Number(g.progress)} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}
        {evaluations && evaluations.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Avaliações Recentes</h4>
            <div className="space-y-1">
              {evaluations.map((e, i) => (
                <div key={i} className="rounded-lg border p-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{String(e.evaluator)}</span>
                    <Badge variant="secondary">{Number(e.score)}/100</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{String(e.feedback)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {achievements && achievements.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Conquistas</h4>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {String(a.icon)} {String(a.title)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const overall = summary.overall as Record<string, number> | undefined
  const teamPerf = summary.team_performance as Array<Record<string, unknown>> | undefined
  const topPerformers = summary.top_performers as Array<Record<string, unknown>> | undefined
  const goalStatus = summary.goal_status as Record<string, number> | undefined

  return (
    <div className="max-h-[65vh] space-y-4 overflow-y-auto">
      <p className="text-sm text-muted-foreground">
        Período: {new Date(report.period_start).toLocaleDateString('pt-BR')} —{' '}
        {new Date(report.period_end).toLocaleDateString('pt-BR')}
      </p>
      {overall && (
        <div className="grid grid-cols-2 gap-2">
          <KPICard label="Total Conversas" value={String(overall.total_conversations ?? '—')} />
          <KPICard
            label="Conversão Média"
            value={`${Number(overall.avg_conversion_rate ?? 0).toFixed(1)}%`}
          />
          <KPICard
            label="Tempo Resposta"
            value={`${Math.round(overall.avg_response_time ?? 0)}s`}
          />
          <KPICard
            label="Satisfação Média"
            value={Number(overall.avg_satisfaction ?? 0).toFixed(1)}
          />
        </div>
      )}
      {teamPerf && teamPerf.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Performance por Equipe</h4>
          <ChartContainer config={barConfig} className="h-[200px] w-full">
            <BarChart data={teamPerf} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="conversations"
                fill="var(--color-conversations)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
      {topPerformers && topPerformers.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Top Performers</h4>
          <div className="space-y-1">
            {topPerformers.map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border p-2">
                <Badge>{i + 1}</Badge>
                <span className="text-sm font-medium">{String(p.name)}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {Number(p.conversion_rate).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {goalStatus && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Status das Metas</h4>
          <div className="flex gap-2">
            <Badge variant="default">{goalStatus.active || 0} ativas</Badge>
            <Badge variant="secondary">{goalStatus.completed || 0} concluídas</Badge>
            <Badge variant="destructive">{goalStatus.overdue || 0} atrasadas</Badge>
          </div>
        </div>
      )}
    </div>
  )
}
