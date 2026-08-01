import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, Printer } from 'lucide-react'

interface DateRangeExportProps {
  onCSV: (startDate: string, endDate: string) => void
  onPDF: (startDate: string, endDate: string) => void
}

export function DateRangeExport({ onCSV, onPDF }: DateRangeExportProps) {
  const [preset, setPreset] = useState('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const getDates = () => {
    if (preset === 'custom') return { start: customStart, end: customEnd }
    const end = new Date()
    const start = new Date()
    if (preset === '7d') start.setDate(start.getDate() - 7)
    else if (preset === '30d') start.setDate(start.getDate() - 30)
    else if (preset === '90d') start.setDate(start.getDate() - 90)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  const dates = getDates()
  const canExport = preset !== 'custom' || (customStart && customEnd)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={setPreset}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="90d">Últimos 90 dias</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {preset === 'custom' && (
        <>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="w-[150px]"
          />
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="w-[150px]"
          />
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={!canExport}
        onClick={() => onCSV(dates.start, dates.end)}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canExport}
        onClick={() => onPDF(dates.start, dates.end)}
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar PDF</span>
      </Button>
    </div>
  )
}
