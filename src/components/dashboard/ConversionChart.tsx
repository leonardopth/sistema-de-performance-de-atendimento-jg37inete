import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  conversions: { label: 'Conversões', color: 'hsl(var(--chart-1))' },
  total: { label: 'Total', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

interface TrendPoint {
  month: string
  conversions: number
  total: number
}

export function ConversionChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-conversions)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-conversions)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          fill="url(#fillTotal)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="conversions"
          stroke="var(--color-conversions)"
          fill="url(#fillConversions)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
