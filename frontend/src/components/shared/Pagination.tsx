import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  previousLabel?: string
  nextLabel?: string
  pageLabel?: string
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
  className,
}: PaginationProps) {
  return (
    <div className={cn('flex items-center justify-center sm:justify-end space-x-2 py-4', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        {previousLabel && (
          <span className="hidden sm:inline ml-1">{previousLabel}</span>
        )}
      </Button>
      {pageLabel && (
        <span className="text-xs sm:text-sm text-muted-foreground px-2">
          {pageLabel}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {nextLabel && (
          <span className="hidden sm:inline mr-1">{nextLabel}</span>
        )}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
