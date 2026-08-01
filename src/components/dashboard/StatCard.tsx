import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  compareEnabled?: boolean
  previousValue?: string
  deltaPct?: number
  invertDelta?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  compareEnabled,
  previousValue,
  deltaPct,
  invertDelta,
}: StatCardProps) {
  const isPositive = (deltaPct ?? 0) >= 0
  const isImprovement = invertDelta ? !isPositive : isPositive

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {compareEnabled && previousValue && deltaPct !== undefined ? (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                isImprovement
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {Math.abs(deltaPct).toFixed(1)}%
            </span>
          ) : trend !== undefined ? (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                (trend ?? 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {(trend ?? 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {Math.abs(trend)}%{trendLabel ? ` ${trendLabel}` : ''}
            </span>
          ) : null}
        </div>
        {compareEnabled && previousValue && (
          <p className="mt-1 text-xs text-muted-foreground">anterior: {previousValue}</p>
        )}
      </CardContent>
    </Card>
  )
}
