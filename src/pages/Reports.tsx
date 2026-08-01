import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Download, Printer, FileText } from 'lucide-react'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { getReports } from '@/services/reports'
import {
  getReportSchedules,
  updateReportSchedule,
  createReportSchedule,
} from '@/services/report-schedules'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { ReportView } from '@/components/ReportView'
import { downloadCSV } from '@/lib/export-utils'
import { toast } from 'sonner'
import type { Report, ReportSchedule } from '@/types'

const dayOptions = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
]

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

export default function ReportsPage() {
  const { user } = useAuth()
  const { data: reports, loading, error, reload } = useAsyncData<Report[]>(() => getReports())
  const { data: schedules, reload: reloadSchedules } = useAsyncData<ReportSchedule[]>(() =>
    getReportSchedules(),
  )
  useRealtime('reports', () => reload())
  useRealtime('report_schedules', () => reloadSchedules())

  const [viewReport, setViewReport] = useState<Report | null>(null)
  const schedule = schedules?.[0]

  const handleScheduleToggle = async (enabled: boolean) => {
    if (schedule) {
      await updateReportSchedule(schedule.id, { enabled })
    } else if (user) {
      await createReportSchedule({
        enabled,
        day_of_week: 'monday',
        configured_by: user.id as string,
      })
    }
    reloadSchedules()
    toast.success(
      enabled ? 'Relatórios automáticos ativados' : 'Relatórios automáticos desativados',
    )
  }

  const handleDayChange = async (day: string) => {
    if (schedule) {
      await updateReportSchedule(schedule.id, { day_of_week: day as ReportSchedule['day_of_week'] })
      reloadSchedules()
      toast.success('Dia da semana atualizado')
    }
  }

  const handleCSV = (report: Report) => {
    const summary = parseSummary(report)
    const overall = summary.overall as Record<string, number> | undefined
    const agentPerf = summary.agent_performance as Array<Record<string, unknown>> | undefined
    const rows: (string | number)[][] = [
      [report.title],
      [
        `Período: ${new Date(report.period_start).toLocaleDateString('pt-BR')} - ${new Date(report.period_end).toLocaleDateString('pt-BR')}`,
      ],
      [],
      ['KPI', 'Valor'],
      ...(overall
        ? Object.entries(overall).map(([k, v]) => [k, typeof v === 'number' ? v.toFixed(2) : v])
        : []),
      [],
      ['Agente', 'Equipe', 'Conversas', 'Conversão (%)', 'Tempo Resposta (s)', 'Satisfação'],
      ...(agentPerf || []).map((a) => [
        a.name as string,
        a.team as string,
        a.conversations as number,
        a.conversion_rate as number,
        a.avg_response_time as number,
        a.satisfaction_score as number,
      ]),
    ]
    downloadCSV(`relatorio_${report.id}`, rows)
  }

  const handlePDF = (report: Report) => {
    const summary = parseSummary(report)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>${report.title}</title></head><body>
      <h1>${report.title}</h1>
      <p>Período: ${new Date(report.period_start).toLocaleDateString('pt-BR')} - ${new Date(report.period_end).toLocaleDateString('pt-BR')}</p>
      <h2>KPIs Gerais</h2>
      <pre>${JSON.stringify(summary.overall || {}, null, 2)}</pre>
      <h2>Performance por Equipe</h2>
      <pre>${JSON.stringify(summary.team_performance || {}, null, 2)}</pre>
      <h2>Top Performers</h2>
      <pre>${JSON.stringify(summary.top_performers || {}, null, 2)}</pre>
      <h2>Status das Metas</h2>
      <pre>${JSON.stringify(summary.goal_status || {}, null, 2)}</pre>
    </body></html>`)
    w.document.close()
    w.print()
  }

  if (loading) return <LoadingState message="Carregando relatórios..." />
  if (error || !reports) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Relatórios de performance e configuração de geração automática
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Relatório Automático Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={schedule?.enabled ?? false} onCheckedChange={handleScheduleToggle} />
            <span className="text-sm">Geração semanal automática</span>
          </div>
          {schedule?.enabled && (
            <Select value={schedule.day_of_week} onValueChange={handleDayChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum relatório gerado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Geração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.period_start).toLocaleDateString('pt-BR')} —{' '}
                      {new Date(r.period_end).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewReport(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCSV(r)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePDF(r)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!viewReport} onOpenChange={(v) => !v && setViewReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewReport?.title}</DialogTitle>
          </DialogHeader>
          {viewReport && <ReportView report={viewReport} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
