import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getEvaluations } from '@/services/evaluations'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Evaluation } from '@/types'

const categoryLabel: Record<string, string> = {
  quality: 'Qualidade',
  efficiency: 'Eficiência',
  communication: 'Comunicação',
}

export default function FeedbackPage() {
  const { data, loading, error, reload } = useAsyncData<Evaluation[]>(() => getEvaluations())
  useRealtime('evaluations', () => reload())

  if (loading) return <LoadingState message="Carregando avaliações..." />
  if (error || !data) return <ErrorState onRetry={reload} />

  const avgScore = data.length > 0 ? data.reduce((s, e) => s + e.score, 0) / data.length : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          {data.length} avaliações • Média: {avgScore.toFixed(1)}/100
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((ev) => {
          const agent = ev.expand?.agent_id as { name?: string } | undefined
          const scoreColor =
            ev.score >= 90
              ? 'text-green-600 dark:text-green-400'
              : ev.score >= 75
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          return (
            <Card key={ev.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {(agent?.name || '?')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{agent?.name || 'Agente'}</p>
                      <p className="text-xs text-muted-foreground">Avaliado por {ev.evaluator}</p>
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1 text-lg font-bold', scoreColor)}>
                    <Star className="h-4 w-4 fill-current" />
                    {ev.score}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="outline">{categoryLabel[ev.category] || ev.category}</Badge>
                <p className="text-sm text-muted-foreground">{ev.feedback}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
