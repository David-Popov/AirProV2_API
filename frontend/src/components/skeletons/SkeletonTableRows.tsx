import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const colWidths = ['w-32', 'w-24', 'w-28', 'w-20', 'w-16', 'w-24', 'w-12']

interface SkeletonTableRowsProps {
  columns: number
  rows?: number
}

export function SkeletonTableRows({ columns, rows = 5 }: SkeletonTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className={j === columns - 1 ? 'text-center' : ''}>
              <Skeleton className={`h-4 ${colWidths[j % colWidths.length]}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
