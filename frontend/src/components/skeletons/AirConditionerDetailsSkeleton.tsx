import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function AirConditionerDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      <Skeleton className="h-8 w-24 mb-4" />

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />

        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-1.5" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-44" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-1 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
