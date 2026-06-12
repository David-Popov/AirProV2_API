import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { problemReportsService } from '@/services'
import type { ProblemCategory } from '@/types'

export function useProblemReports() {
  return useQuery({
    queryKey: queryKeys.problemReports.list(),
    queryFn: () => problemReportsService.getAllProblemReports(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProblemCategories() {
  return useQuery({
    queryKey: queryKeys.problemReports.categories(),
    queryFn: () => problemReportsService.getCategories(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useCreateProblemReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ category, description, screenshot }: {
      category: ProblemCategory
      description: string
      screenshot?: File
    }) => problemReportsService.createProblemReport(category, description, screenshot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problemReports.all })
    },
  })
}

export function useDeleteProblemReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => problemReportsService.deleteProblemReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problemReports.all })
    },
  })
}
