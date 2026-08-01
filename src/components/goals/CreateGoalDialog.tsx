import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAsyncData } from '@/hooks/use-async-data'
import { getTeams } from '@/services/teams'
import { createGoal } from '@/services/goals'
import { toast } from 'sonner'
import type { Team } from '@/types'

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const goalTypes = [
  { value: 'conversion', label: 'Conversão' },
  { value: 'satisfaction', label: 'Satisfação' },
  { value: 'response_time', label: 'Tempo de Resposta' },
]

const periodTypes = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'custom', label: 'Personalizado' },
]

function getMonthRange() {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
  }
}

function getQuarterRange() {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3)
  return {
    start: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
    end: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
  }
}

export function CreateGoalDialog({ open, onOpenChange, onCreated }: CreateGoalDialogProps) {
  const { data: teams } = useAsyncData<Team[]>(() => getTeams())
  const [title, setTitle] = useState('')
  const [type, setType] = useState('conversion')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('0')
  const [periodType, setPeriodType] = useState('monthly')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [teamId, setTeamId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (periodType === 'monthly') {
      const r = getMonthRange()
      setPeriodStart(r.start)
      setPeriodEnd(r.end)
    } else if (periodType === 'quarterly') {
      const r = getQuarterRange()
      setPeriodStart(r.start)
      setPeriodEnd(r.end)
    }
  }, [periodType])

  const periodLabel =
    periodType === 'monthly'
      ? new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : periodType === 'quarterly'
        ? `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`
        : `${periodStart} - ${periodEnd}`

  const handleSubmit = async () => {
    if (!title || !target || !teamId) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setSaving(true)
    const result = await createGoal({
      title,
      type,
      target: Number(target),
      current: Number(current),
      period: periodLabel,
      period_type: periodType,
      period_start: periodStart,
      period_end: periodEnd,
      team_id: teamId,
      status: 'active',
      due_date: periodEnd,
    })
    setSaving(false)
    if (result) {
      toast.success('Meta criada com sucesso')
      onOpenChange(false)
      onCreated()
      setTitle('')
      setTarget('')
      setCurrent('0')
    } else {
      toast.error('Erro ao criar meta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Taxa de Conversão Q3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipe *</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(teams || []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta *</Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Ex: 35"
              />
            </div>
            <div className="space-y-2">
              <Label>Atual</Label>
              <Input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Período *</Label>
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodTypes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {periodType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Criando...' : 'Criar Meta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
