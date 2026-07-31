import pb from '@/lib/pocketbase/client'
import type { Goal } from '@/types'

const mockGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Taxa de Conversão Q3',
    agent_id: '',
    team_id: 't1',
    type: 'conversion',
    target: 35,
    current: 27.6,
    period: 'Q3 2026',
    status: 'active',
    created: '',
    updated: '',
    expand: { team_id: { id: 't1', name: 'Vendas Online' } },
  },
  {
    id: 'g2',
    title: 'Satisfação do Cliente',
    agent_id: '',
    team_id: 't2',
    type: 'satisfaction',
    target: 4.8,
    current: 4.47,
    period: 'Q3 2026',
    status: 'active',
    created: '',
    updated: '',
    expand: { team_id: { id: 't2', name: 'Suporte Premium' } },
  },
  {
    id: 'g3',
    title: 'Tempo de Resposta',
    agent_id: '',
    team_id: 't3',
    type: 'response_time',
    target: 40,
    current: 46.5,
    period: 'Q3 2026',
    status: 'active',
    created: '',
    updated: '',
    expand: { team_id: { id: 't3', name: 'Corporativo' } },
  },
  {
    id: 'g4',
    title: 'Conversões Mensais',
    agent_id: '',
    team_id: 't1',
    type: 'conversion',
    target: 200,
    current: 168,
    period: 'Julho 2026',
    status: 'active',
    created: '',
    updated: '',
    expand: { team_id: { id: 't1', name: 'Vendas Online' } },
  },
  {
    id: 'g5',
    title: 'NPS Equipe Premium',
    agent_id: '',
    team_id: 't2',
    type: 'satisfaction',
    target: 90,
    current: 85,
    period: 'Q3 2026',
    status: 'active',
    created: '',
    updated: '',
    expand: { team_id: { id: 't2', name: 'Suporte Premium' } },
  },
  {
    id: 'g6',
    title: 'Tempo Médio Atendimento',
    agent_id: '',
    team_id: 't3',
    type: 'response_time',
    target: 300,
    current: 310,
    period: 'Julho 2026',
    status: 'overdue',
    created: '',
    updated: '',
    expand: { team_id: { id: 't3', name: 'Corporativo' } },
  },
]

export const getGoals = async (): Promise<Goal[]> => {
  try {
    return (await pb
      .collection('goals')
      .getFullList({ expand: 'team_id', sort: '-created' })) as unknown as Goal[]
  } catch {
    return mockGoals
  }
}
