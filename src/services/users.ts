import pb from '@/lib/pocketbase/client'

export interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  created: string
  updated: string
}

export const getUsers = async (): Promise<UserRecord[]> => {
  try {
    return (await pb
      .collection('users')
      .getFullList({ sort: '-created' })) as unknown as UserRecord[]
  } catch {
    return []
  }
}

export const updateUserRole = async (id: string, role: string): Promise<boolean> => {
  try {
    await pb.collection('users').update(id, { role })
    return true
  } catch {
    return false
  }
}
