import type { ComponentType } from 'react'
import type { UserRole } from '@/types'

export interface NavItem {
  path: string
  label: string
  icon: ComponentType<{ className?: string }>
  roles: UserRole[]
}

const rolePages: Record<UserRole, string[]> = {
  admin: [
    '/',
    '/agents',
    '/teams',
    '/conversations',
    '/goals',
    '/feedback',
    '/reports',
    '/my-performance',
    '/users',
  ],
  gestor: [
    '/',
    '/agents',
    '/teams',
    '/conversations',
    '/goals',
    '/feedback',
    '/reports',
    '/my-performance',
  ],
  supervisor: [
    '/',
    '/agents',
    '/teams',
    '/conversations',
    '/goals',
    '/feedback',
    '/reports',
    '/my-performance',
  ],
  agente: ['/my-performance'],
}

export function getUserRole(user: Record<string, unknown> | null): UserRole {
  return (user?.role as UserRole) || 'agente'
}

export function canAccessPage(user: Record<string, unknown> | null, path: string): boolean {
  const role = getUserRole(user)
  return (rolePages[role] || []).includes(path)
}

export function getDefaultPage(user: Record<string, unknown> | null): string {
  return getUserRole(user) === 'agente' ? '/my-performance' : '/'
}

export function canCreateGoals(user: Record<string, unknown> | null): boolean {
  const role = getUserRole(user)
  return role === 'admin' || role === 'gestor'
}

export function canManageReports(user: Record<string, unknown> | null): boolean {
  const role = getUserRole(user)
  return role === 'admin' || role === 'gestor'
}
