import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Agent } from '@/types'

interface RankingProps {
  agents: Agent[]
  achievementCounts: Record<string, number>
}

const medals = ['🥇', '🥈', '🥉']

export function Ranking({ agents, achievementCounts }: RankingProps) {
  const [sortMode, setSortMode] = useState<'conversion' | 'satisfaction'>('conversion')

  const sorted = [...agents]
    .sort((a, b) =>
      sortMode === 'conversion'
        ? b.conversion_rate - a.conversion_rate
        : b.satisfaction_score - a.satisfaction_score,
    )
    .slice(0, 10)

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={sortMode}
        onValueChange={(v) => v && setSortMode(v as 'conversion' | 'satisfaction')}
      >
        <ToggleGroupItem value="conversion">Por conversão</ToggleGroupItem>
        <ToggleGroupItem value="satisfaction">Por satisfação</ToggleGroupItem>
      </ToggleGroup>
      <div className="space-y-2">
        {sorted.map((agent, index) => (
          <div
            key={agent.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              index < 3 ? 'border-primary/30 bg-primary/5' : ''
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-lg">
              {index < 3 ? (
                medals[index]
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
              )}
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {agent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{agent.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {(agent.expand?.team_id as { name?: string })?.name || 'Sem equipe'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(achievementCounts[agent.id] || 0) > 0 && (
                <Badge variant="outline" className="gap-1">
                  🏆 {achievementCounts[agent.id]}
                </Badge>
              )}
              <Badge variant="secondary" className="font-mono">
                {sortMode === 'conversion'
                  ? `${agent.conversion_rate.toFixed(1)}%`
                  : agent.satisfaction_score.toFixed(1)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
