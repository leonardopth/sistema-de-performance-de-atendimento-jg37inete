import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  conversations: { label: 'Conversas', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

interface TeamPoint {
  name: string
  conversations: number
}

export function TeamChart({ data }: { data: TeamPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="conversations" fill="var(--color-conversations)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
