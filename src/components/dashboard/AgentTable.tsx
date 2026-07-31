import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import type { Agent } from '@/types'
import { cn } from '@/lib/utils'

type SortKey =
  | 'name'
  | 'total_conversations'
  | 'conversion_rate'
  | 'avg_response_time'
  | 'satisfaction_score'

export function AgentTable({ agents }: { agents: Agent[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('conversion_rate')
  const [asc, setAsc] = useState(false)

  const sorted = [...agents].sort((a, b) => {
    const dir = asc ? 1 : -1
    if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
    return ((a[sortKey] as number) - (b[sortKey] as number)) * dir
  })

  const toggle = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc)
    else {
      setSortKey(key)
      setAsc(false)
    }
  }

  const roleLabel: Record<string, string> = { lead: 'Líder', senior: 'Sênior', agent: 'Agente' }

  const Th = ({
    label,
    keyName,
    className,
  }: {
    label: string
    keyName: SortKey
    className?: string
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium"
        onClick={() => toggle(keyName)}
      >
        {label} <ArrowUpDown className="ml-1 inline h-3 w-3" />
      </Button>
    </TableHead>
  )

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <Th label="Agente" keyName="name" />
            <TableHead>Equipe</TableHead>
            <TableHead>Função</TableHead>
            <Th label="Conversas" keyName="total_conversations" className="text-right" />
            <Th label="Conv." keyName="conversion_rate" className="text-right" />
            <Th label="Resp." keyName="avg_response_time" className="text-right" />
            <Th label="NPS" keyName="satisfaction_score" className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium">{agent.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {(agent.expand?.team_id as { name?: string })?.name || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabel[agent.role] || agent.role}</Badge>
              </TableCell>
              <TableCell className="text-right">{agent.total_conversations}</TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium',
                  agent.conversion_rate >= 30 ? 'text-green-600 dark:text-green-400' : '',
                )}
              >
                {agent.conversion_rate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">{agent.avg_response_time}s</TableCell>
              <TableCell className="text-right">{agent.satisfaction_score.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
