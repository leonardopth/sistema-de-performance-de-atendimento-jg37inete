import pb from '@/lib/pocketbase/client'
import type { Evaluation } from '@/types'

const mockEvals: Evaluation[] = [
  {
    id: 'e1',
    agent_id: 'a1',
    evaluator: 'Carlos Mendes',
    score: 92,
    feedback: 'Excelente desempenho em conversões.',
    category: 'quality',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a1', name: 'Ana Silva' } },
  },
  {
    id: 'e2',
    agent_id: 'a2',
    evaluator: 'Carlos Mendes',
    score: 85,
    feedback: 'Bom desempenho, melhorar tempo de resposta.',
    category: 'efficiency',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a2', name: 'Bruno Costa' } },
  },
  {
    id: 'e3',
    agent_id: 'a3',
    evaluator: 'Carlos Mendes',
    score: 78,
    feedback: 'Precisa melhorar taxa de conversão.',
    category: 'communication',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a3', name: 'Carla Mendes' } },
  },
  {
    id: 'e4',
    agent_id: 'a4',
    evaluator: 'Marina Costa',
    score: 95,
    feedback: 'Desempenho excepcional, referência da equipe.',
    category: 'quality',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a4', name: 'Diego Santos' } },
  },
  {
    id: 'e5',
    agent_id: 'a5',
    evaluator: 'Marina Costa',
    score: 88,
    feedback: 'Ótima comunicação e resultados consistentes.',
    category: 'communication',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a5', name: 'Elena Rocha' } },
  },
  {
    id: 'e6',
    agent_id: 'a6',
    evaluator: 'Marina Costa',
    score: 72,
    feedback: 'Necessita treinamento em técnicas de fechamento.',
    category: 'efficiency',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a6', name: 'Felipe Alves' } },
  },
  {
    id: 'e7',
    agent_id: 'a7',
    evaluator: 'Roberto Alves',
    score: 96,
    feedback: 'Melhor conversão da empresa, parabéns!',
    category: 'quality',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a7', name: 'Gabriel Lima' } },
  },
  {
    id: 'e8',
    agent_id: 'a8',
    evaluator: 'Roberto Alves',
    score: 81,
    feedback: 'Boa evolução, focar em reduzir tempo de resposta.',
    category: 'efficiency',
    created: '',
    updated: '',
    expand: { agent_id: { id: 'a8', name: 'Helena Dias' } },
  },
]

export const getEvaluations = async (): Promise<Evaluation[]> => {
  try {
    return (await pb
      .collection('evaluations')
      .getFullList({ expand: 'agent_id', sort: '-created' })) as unknown as Evaluation[]
  } catch {
    return mockEvals
  }
}

export const getEvaluationsByAgent = async (agentId: string): Promise<Evaluation[]> => {
  try {
    return (await pb
      .collection('evaluations')
      .getFullList({
        filter: `agent_id = "${agentId}"`,
        sort: '-created',
      })) as unknown as Evaluation[]
  } catch {
    return mockEvals.filter((e) => e.agent_id === agentId)
  }
}
