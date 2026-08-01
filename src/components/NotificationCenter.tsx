import { useState, useEffect, useCallback } from 'react'
import { Bell, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '@/services/notifications'
import { ShareMenu } from '@/components/ShareMenu'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

const typeIcon: Record<string, string> = {
  goal_completed: '🎯',
  goal_overdue: '⏰',
  badge_earned: '🏆',
  system: '📢',
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setNotifications(await getNotifications())
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('notifications', () => load())

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} não lidas</Badge>}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 20).map((notif) => (
                <div
                  key={notif.id}
                  className={cn('flex gap-3 border-b px-4 py-3', !notif.read && 'bg-muted/50')}
                >
                  <span className="text-lg">{typeIcon[notif.type] || '📢'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{notif.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notif.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <ShareMenu notification={notif} />
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRead(notif.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDelete(notif.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
