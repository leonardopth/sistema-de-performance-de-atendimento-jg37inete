import { Share2, MessageCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notification } from '@/types'

function buildShareText(notification: Notification): string {
  let text = `${notification.title}\n\n${notification.message}`
  const agent = notification.expand?.related_agent as { name?: string } | undefined
  const goal = notification.expand?.related_goal as { title?: string } | undefined
  if (agent?.name) text += `\n\nAgente: ${agent.name}`
  if (goal?.title) text += `\nMeta: ${goal.title}`
  return text
}

export function ShareMenu({ notification }: { notification: Notification }) {
  const shareText = buildShareText(notification)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(notification.title)}&body=${encodeURIComponent(shareText)}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Share2 className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            Compartilhar via WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={emailUrl} className="flex items-center gap-2 cursor-pointer">
            <Mail className="h-4 w-4" />
            Compartilhar via Email
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
