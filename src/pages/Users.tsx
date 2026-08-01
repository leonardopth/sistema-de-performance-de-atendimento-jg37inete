import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAsyncData } from '@/hooks/use-async-data'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, updateUserRole, type UserRecord } from '@/services/users'
import { LoadingState, ErrorState } from '@/components/PageStates'
import { toast } from 'sonner'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  supervisor: 'Supervisor',
  agente: 'Agente',
}

export default function UsersPage() {
  const { data: users, loading, error, reload } = useAsyncData<UserRecord[]>(() => getUsers())
  useRealtime('users', () => reload())
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdating(userId)
    const success = await updateUserRole(userId, role)
    setUpdating(null)
    if (success) {
      toast.success('Role atualizada com sucesso')
      reload()
    } else {
      toast.error('Erro ao atualizar role')
    }
  }

  if (loading) return <LoadingState message="Carregando usuários..." />
  if (error || !users) return <ErrorState onRetry={reload} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[160px]">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role || 'agente'}
                      onValueChange={(role) => handleRoleChange(u.id, role)}
                      disabled={updating === u.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
