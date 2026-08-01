import pb from '@/lib/pocketbase/client'
import type { Conversation } from '@/types'

interface PaginatedResult<T> {
  items: T[]
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

const mockItems: Conversation[] = Array.from({ length: 15 }, (_, i) => ({
  id: `c${i + 1}`,
  agent_id: `a${(i % 8) + 1}`,
  customer_name: `Cliente ${i + 1}`,
  status: ['open', 'closed', 'lost'][i % 3],
  channel: ['whatsapp', 'email', 'chat', 'phone'][i % 4],
  started_at: `2026-07-${String((i % 28) + 1).padStart(2, '0')}T10:00:00.000Z`,
  duration: ((i * 37) % 500) + 60,
  outcome: ['converted', 'not_converted', 'pending'][i % 3],
  satisfaction: Math.round((((i * 7) % 20) + 30) / 10),
  created: '',
  updated: '',
}))

export const getConversations = async (
  page = 1,
  perPage = 10,
): Promise<PaginatedResult<Conversation>> => {
  try {
    const result = await pb
      .collection('conversations')
      .getList(page, perPage, { expand: 'agent_id', sort: '-started_at' })
    return result as unknown as PaginatedResult<Conversation>
  } catch {
    const start = (page - 1) * perPage
    return {
      items: mockItems.slice(start, start + perPage),
      page,
      perPage,
      totalItems: mockItems.length,
      totalPages: Math.ceil(mockItems.length / perPage),
    }
  }
}

export const getConversationsByAgent = async (agentId: string): Promise<Conversation[]> => {
  try {
    return (await pb
      .collection('conversations')
      .getFullList({
        filter: `agent_id = "${agentId}"`,
        sort: '-started_at',
      })) as unknown as Conversation[]
  } catch {
    return mockItems.filter((c) => c.agent_id === agentId)
  }
}
