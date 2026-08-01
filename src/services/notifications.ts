import pb from '@/lib/pocketbase/client'
import type { Notification } from '@/types'

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    return (await pb.collection('notifications').getFullList({
      sort: '-created',
      expand: 'related_agent,related_goal',
    })) as unknown as Notification[]
  } catch {
    return []
  }
}

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await pb.collection('notifications').update(id, { read: true })
  } catch {
    /* intentionally ignored */
  }
}

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await pb.collection('notifications').delete(id)
  } catch {
    /* intentionally ignored */
  }
}
