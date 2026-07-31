import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Agent } from '@/types'

export function TopPerformers({ agents }: { agents: Agent[] }) {
  return (
    <div className="space-y-4">
      {agents.map((agent, index) => (
        <div key={agent.id} className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
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
          <Badge variant="secondary" className="font-mono">
            {agent.conversion_rate.toFixed(1)}%
          </Badge>
        </div>
      ))}
    </div>
  )
}
