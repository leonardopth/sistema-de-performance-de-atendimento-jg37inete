import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

interface ExportButtonsProps {
  onCSV: () => void
  onPDF: () => void
}

export function ExportButtons({ onCSV, onPDF }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onCSV}>
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar CSV</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onPDF}>
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar PDF</span>
      </Button>
    </div>
  )
}
