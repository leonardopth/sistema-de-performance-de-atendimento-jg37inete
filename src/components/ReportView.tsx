import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export function ReportView({ report }: { report: Report }) {
  const summary = parseSummary(report)
  const overall = summary.overall as Record<string, number> | undefined
  const teamPerf = summary.team_performance as Array<Record<string, unknown>> | undefined
  const topPerformers = summary.top_performers as Array<Record<string, unknown>> | undefined
  const goalStatus = summary.goal_status as Record<string, number> | undefined

  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto">
      <p className="text-sm text-muted-foreground">
        Período: {new Date(report.period_start).toLocaleDateString('pt-BR')} —{' '}
        {new Date(report.period_end).toLocaleDateString('pt-BR')}
      </p>
      <div>
        <h4 className="mb-2 text-sm font-semibold">KPIs Gerais</h4>
        <div className="grid grid-cols-2 gap-2">
          {overall &&
            Object.entries(overall).map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-lg border p-2">
                <span className="text-xs text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">
                  {typeof v === 'number' ? v.toFixed(1) : String(v)}
                </span>
              </div>
            ))}
        </div>
      </div>
      {teamPerf && teamPerf.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Performance por Equipe</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipe</TableHead>
                <TableHead>Conversas</TableHead>
                <TableHead>Agentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamPerf.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{String(t.name)}</TableCell>
                  <TableCell>{String(t.conversations)}</TableCell>
                  <TableCell>{String(t.agents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
