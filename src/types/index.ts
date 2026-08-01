export interface Team {
  id: string
  name: string
  description: string
  created: string
  updated: string
}

export interface Agent {
  id: string
  name: string
  email: string
  team_id: string
  avatar: string
  status: string
  role: string
  total_conversations: number
  conversion_rate: number
  avg_response_time: number
  satisfaction_score: number
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface Conversation {
  id: string
  agent_id: string
  customer_name: string
  status: string
  channel: string
  started_at: string
  duration: number
  outcome: string
  satisfaction: number
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface Goal {
  id: string
  title: string
  agent_id: string
  team_id: string
  type: string
  target: number
  current: number
  period: string
  status: string
  due_date?: string
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface Evaluation {
  id: string
  agent_id: string
  evaluator: string
  score: number
  feedback: string
  category: string
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'goal_completed' | 'goal_overdue' | 'badge_earned' | 'system'
  related_agent: string
  related_goal: string
  read: boolean
  recipient: string
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface Achievement {
  id: string
  agent_id: string
  title: string
  description: string
  icon: string
  category: 'conversion' | 'productivity' | 'quality' | 'satisfaction' | 'goal'
  awarded_at: string
  created: string
  updated: string
  expand?: Record<string, unknown>
}
