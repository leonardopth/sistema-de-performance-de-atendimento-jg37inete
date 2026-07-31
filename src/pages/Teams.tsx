import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getTeams } from '@/services/teams'
import { getAgents } from '@/services/agents'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { Users, TrendingUp, Clock } from 'lucide-react'
import type { Team, Agent } from '@/types'

export default function TeamsPage() {
  const { data: teams, loading: tl, error: te, reload: tr } = useAsyncData<Team[]>(() => getTeams())
  const { data: agents, loading: al, error: ae } = useAsyncData<Agent[]>(() => getAgents())
  useRealtime('teams', () => tr())

  if (tl || al) return <LoadingState message="Carregando equipes..." />
  if (te || ae || !teams || !agents) return <ErrorState onRetry={tr} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipes</h1>
        <p className="text-sm text-muted-foreground">{teams.length} equipes ativas</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const teamAgents = agents.filter((a) => {
            const t = a.expand?.team_id as { id?: string }
            return t?.id === team.id || a.team_id === team.id
          })
          const avgConv =
            teamAgents.length > 0
              ? teamAgents.reduce((s, a) => s + a.conversion_rate, 0) / teamAgents.length
              : 0
          const avgResp =
            teamAgents.length > 0
              ? teamAgents.reduce((s, a) => s + a.avg_response_time, 0) / teamAgents.length
              : 0
          return (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {team.name}
                  <Badge variant="secondary">{teamAgents.length} membros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{team.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversão</p>
                      <p className="text-sm font-medium">{avgConv.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resposta</p>
                      <p className="text-sm font-medium">{Math.round(avgResp)}s</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {teamAgents.slice(0, 4).map((a) => (
                    <Badge key={a.id} variant="outline" className="text-xs">
                      {a.name}
                    </Badge>
                  ))}
                  {teamAgents.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{teamAgents.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
