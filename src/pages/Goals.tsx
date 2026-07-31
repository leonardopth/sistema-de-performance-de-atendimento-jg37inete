import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getGoals } from '@/services/goals'
import { LoadingState, ErrorState } from '@/components/PageStates'
import type { Goal } from '@/types'

const typeLabel: Record<string, string> = {
  conversion: 'Conversão',
  satisfaction: 'Satisfação',
  response_time: 'Tempo de Resposta',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  overdue: 'destructive',
}

export default function GoalsPage() {
  const { data, loading, error, reload } = useAsyncData<Goal[]>(() => getGoals())
  useRealtime('goals', () => reload())

  if (loading) return <LoadingState message="Carregando metas..." />
  if (error || !data) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Metas</h1>
        <p className="text-sm text-muted-foreground">{data.length} metas em acompanhamento</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((goal) => {
          const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100)
          const team = goal.expand?.team_id as { name?: string } | undefined
          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between text-base">
                  <span>{goal.title}</span>
                  <Badge variant={statusVariant[goal.status] || 'secondary'}>
                    {goal.status === 'active'
                      ? 'Ativa'
                      : goal.status === 'completed'
                        ? 'Concluída'
                        : 'Atrasada'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{typeLabel[goal.type] || goal.type}</Badge>
                  {team && <span>• {team.name}</span>}
                  <span>• {goal.period}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{goal.current}</span>
                    <span className="text-sm text-muted-foreground">/ {goal.target}</span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">{progress}% concluído</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
