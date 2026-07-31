import pb from '@/lib/pocketbase/client'
import type { Team } from '@/types'

const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Vendas Online',
    description: 'Equipe de vendas online e WhatsApp',
    created: '',
    updated: '',
  },
  {
    id: 't2',
    name: 'Suporte Premium',
    description: 'Atendimento premium e VIP',
    created: '',
    updated: '',
  },
  {
    id: 't3',
    name: 'Corporativo',
    description: 'Atendimento corporativo B2B',
    created: '',
    updated: '',
  },
]

export const getTeams = async (): Promise<Team[]> => {
  try {
    return (await pb.collection('teams').getFullList({ sort: 'name' })) as unknown as Team[]
  } catch {
    return mockTeams
  }
}
