import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getAgentByEmail } from '@/services/agents'
import { getGoalsByAgent } from '@/services/goals'
import { getAchievementsByAgent } from '@/services/achievements'
import { getEvaluationsByAgent } from '@/services/evaluations'
import { getConversationsByAgent } from '@/services/conversations'
import { LoadingState } from '@/components/PageStates'
import { MessageSquare, Percent, Clock, Star } from 'lucide-react'
import type { Goal, Achievement, Evaluation, Conversation } from '@/types'

export default function MyPerformancePage() {
  const { user } = useAuth()
  const email = (user as { email?: string } | null)?.email || ''

  const {
    data: agent,
    loading,
    reload: reloadAgent,
  } = useAsyncData(() => getAgentByEmail(email), [email])
  const agentId = agent?.id || ''
  const { data: goals, reload: reloadGoals } = useAsyncData<Goal[]>(
    () => (agentId ? getGoalsByAgent(agentId) : Promise.resolve([])),
    [agentId],
  )
  const { data: achievements } = useAsyncData<Achievement[]>(
    () => (agentId ? getAchievementsByAgent(agentId) : Promise.resolve([])),
    [agentId],
  )
  const { data: evaluations } = useAsyncData<Evaluation[]>(
    () => (agentId ? getEvaluationsByAgent(agentId) : Promise.resolve([])),
    [agentId],
  )
  const { data: conversations } = useAsyncData<Conversation[]>(
    () => (agentId ? getConversationsByAgent(agentId) : Promise.resolve([])),
    [agentId],
  )

  useRealtime('agents', () => reloadAgent())
  useRealtime('goals', () => reloadGoals())

  if (loading) return <LoadingState message="Carregando sua performance..." />
  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Nenhum agente vinculado</p>
        <p className="text-sm text-muted-foreground">
          Seu e-mail não está cadastrado como agente no sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minha Performance</h1>
        <p className="text-sm text-muted-foreground">{agent.name}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversas</span>
            </div>
            <p className="text-2xl font-bold">{agent.total_conversations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversão</span>
            </div>
            <p className="text-2xl font-bold">{agent.conversion_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tempo Resposta</span>
            </div>
            <p className="text-2xl font-bold">{agent.avg_response_time}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Satisfação</span>
            </div>
            <p className="text-2xl font-bold">{agent.satisfaction_score.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="space-y-3">
          {(goals || []).map((g) => {
            const progress = Math.min(Math.round((g.current / g.target) * 100), 100)
            return (
              <Card key={g.id}>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{g.title}</span>
                    <Badge>
                      {g.status === 'active'
                        ? 'Ativa'
                        : g.status === 'completed'
                          ? 'Concluída'
                          : 'Atrasada'}
                    </Badge>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">
                    {progress}% — {g.current}/{g.target}
                  </p>
                </CardContent>
              </Card>
            )
          })}
          {(!goals || goals.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma meta atribuída.
            </p>
          )}
        </TabsContent>
        <TabsContent value="achievements" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(achievements || []).map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-3 pt-4">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!achievements || achievements.length === 0) && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Nenhuma conquista ainda.
            </p>
          )}
        </TabsContent>
        <TabsContent value="evaluations" className="space-y-3">
          {(evaluations || []).map((e) => (
            <Card key={e.id}>
              <CardContent className="space-y-1 pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">{e.evaluator}</span>
                  <Badge>{e.score}/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.feedback}</p>
                <Badge variant="outline">{e.category}</Badge>
              </CardContent>
            </Card>
          ))}
          {(!evaluations || evaluations.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma avaliação registrada.
            </p>
          )}
        </TabsContent>
        <TabsContent value="conversations" className="space-y-2">
          {(conversations || []).slice(0, 20).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <span className="font-medium">{c.customer_name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{c.channel}</span>
              </div>
              <Badge variant={c.outcome === 'converted' ? 'default' : 'secondary'}>
                {c.outcome}
              </Badge>
            </div>
          ))}
          {(!conversations || conversations.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma conversa registrada.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
