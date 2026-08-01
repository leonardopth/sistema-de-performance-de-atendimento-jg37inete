import pb from '@/lib/pocketbase/client'
import type { Report } from '@/types'

export const getReports = async (): Promise<Report[]> => {
  try {
    return (await pb.collection('reports').getFullList({ sort: '-created' })) as unknown as Report[]
  } catch {
    return []
  }
}

export const getReport = async (id: string): Promise<Report | null> => {
  try {
    return (await pb.collection('reports').getOne(id)) as unknown as Report
  } catch {
    return null
  }
}

export const deleteReport = async (id: string): Promise<void> => {
  try {
    await pb.collection('reports').delete(id)
  } catch {
    /* intentionally ignored */
  }
}
