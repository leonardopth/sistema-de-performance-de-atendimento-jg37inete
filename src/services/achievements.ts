import pb from '@/lib/pocketbase/client'
import type { Achievement } from '@/types'

const mockAchievements: Achievement[] = [
  {
    id: 'ach1',
    agent_id: 'a1',
    title: 'Produtivo',
    description: 'Mais de 200 conversas atendidas',
    icon: '📈',
    category: 'productivity',
    awarded_at: '2026-07-15T10:00:00.000Z',
    created: '',
    updated: '',
  },
  {
    id: 'ach2',
    agent_id: 'a1',
    title: 'Coração de Ouro',
    description: 'Satisfação do cliente acima de 4.8',
    icon: '😊',
    category: 'satisfaction',
    awarded_at: '2026-07-10T10:00:00.000Z',
    created: '',
    updated: '',
  },
  {
    id: 'ach3',
    agent_id: 'a4',
    title: 'Coração de Ouro',
    description: 'Satisfação do cliente acima de 4.8',
    icon: '😊',
    category: 'satisfaction',
    awarded_at: '2026-07-12T10:00:00.000Z',
    created: '',
    updated: '',
  },
  {
    id: 'ach4',
    agent_id: 'a5',
    title: 'Produtivo',
    description: 'Mais de 200 conversas atendidas',
    icon: '📈',
    category: 'productivity',
    awarded_at: '2026-07-08T10:00:00.000Z',
    created: '',
    updated: '',
  },
  {
    id: 'ach5',
    agent_id: 'a7',
    title: 'Coração de Ouro',
    description: 'Satisfação do cliente acima de 4.8',
    icon: '😊',
    category: 'satisfaction',
    awarded_at: '2026-07-05T10:00:00.000Z',
    created: '',
    updated: '',
  },
]

export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    return (await pb.collection('achievements').getFullList({
      sort: '-awarded_at',
      expand: 'agent_id',
    })) as unknown as Achievement[]
  } catch {
    return mockAchievements
  }
}

export const getAchievementsByAgent = async (agentId: string): Promise<Achievement[]> => {
  try {
    return (await pb.collection('achievements').getFullList({
      filter: `agent_id = "${agentId}"`,
      sort: '-awarded_at',
    })) as unknown as Achievement[]
  } catch {
    return mockAchievements.filter((a) => a.agent_id === agentId)
  }
}
