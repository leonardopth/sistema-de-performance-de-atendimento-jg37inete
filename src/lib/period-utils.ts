export interface PeriodOption {
  value: string
  label: string
}

export const periodOptions: PeriodOption[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
]

export function getPeriodLabel(value: string): string {
  return periodOptions.find((p) => p.value === value)?.label || value
}
