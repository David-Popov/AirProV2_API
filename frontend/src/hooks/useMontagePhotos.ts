import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { montagePhotoService } from '@/services'

export function useMontagePhotos(montageId: string) {
  return useQuery({
    queryKey: queryKeys.montagePhotos.byMontage(montageId),
    queryFn: () => montagePhotoService.getPhotosByMontage(montageId),
    enabled: !!montageId,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePhotoValidationInfo() {
  return useQuery({
    queryKey: queryKeys.montagePhotos.validationInfo(),
    queryFn: () => montagePhotoService.getValidationInfo(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ montageId, file, description, displayOrder }: {
      montageId: string
      file: File
      description?: string
      displayOrder?: number
    }) => montagePhotoService.uploadPhoto(montageId, file, description, displayOrder),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montagePhotos.byMontage(variables.montageId) })
    },
  })
}

export function useUploadPhotos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ montageId, files, description }: {
      montageId: string
      files: File[]
      description?: string
    }) => montagePhotoService.uploadPhotos(montageId, files, description),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montagePhotos.byMontage(variables.montageId) })
    },
  })
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId, description, displayOrder }: {
      photoId: string
      montageId: string
      description?: string
      displayOrder?: number
    }) => montagePhotoService.updatePhoto(photoId, description, displayOrder),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montagePhotos.byMontage(variables.montageId) })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId }: { photoId: string; montageId: string }) =>
      montagePhotoService.deletePhoto(photoId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montagePhotos.byMontage(variables.montageId) })
    },
  })
}
