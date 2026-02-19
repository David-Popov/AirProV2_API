import { Skeleton } from '@/components/ui/skeleton'
import { TableRow, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

const widths = ['w-32', 'w-24', 'w-20', 'w-28', 'w-16', 'w-20', 'w-12']

export function SkeletonTableRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className={j === columns - 1 ? 'text-center' : ''}>
              <Skeleton className={`h-4 ${widths[j % widths.length]}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function SkeletonMobileCards({ rows = 3 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="pt-3 border-t border-border">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
