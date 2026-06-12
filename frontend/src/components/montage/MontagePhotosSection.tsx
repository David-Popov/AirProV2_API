import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  X,
  Plus,
  ZoomIn,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthenticatedImage } from '@/components/shared';
import { toast } from 'sonner';
import { montagePhotoService } from '@/services/montage-photos';
import { apiClient } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { MontagePhoto, PhotoValidationInfo } from '@/types';

interface MontagePhotosSectionProps {
  montageId: string;
  photos?: MontagePhoto[];
  onPhotosChange?: () => void;
}

export function MontagePhotosSection({
  montageId,
  photos: initialPhotos = [],
  onPhotosChange,
}: MontagePhotosSectionProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<MontagePhoto[]>(initialPhotos);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MontagePhoto | null>(null);
  const [validationInfo, setValidationInfo] = useState<PhotoValidationInfo | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchValidationInfo();
    if (initialPhotos.length === 0) {
      fetchPhotos();
    }
  }, [montageId]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const fetchValidationInfo = async () => {
    try {
      const info = await montagePhotoService.getValidationInfo();
      setValidationInfo(info);
    } catch (error) {
      console.error('Failed to fetch validation info:', error);
    }
  };

  const fetchPhotos = async () => {
    if (!montageId) return;
    setIsLoading(true);
    try {
      const data = await montagePhotoService.getPhotosByMontage(montageId);
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (validationInfo) {
      const validation = montagePhotoService.validateFiles(
        files,
        validationInfo,
        photos.length
      );
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }

    setSelectedFiles(files);
    setShowUploadDialog(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      toast.error(t('montages.photos.description_required'));
      return;
    }

    setIsUploading(true);
    try {
      if (selectedFiles.length === 1) {
        const newPhoto = await montagePhotoService.uploadPhoto(
          montageId,
          selectedFiles[0],
          trimmedDescription,
          photos.length
        );
        setPhotos([...photos, newPhoto]);
      } else {
        const newPhotos = await montagePhotoService.uploadPhotos(
          montageId,
          selectedFiles,
          trimmedDescription
        );
        setPhotos([...photos, ...newPhotos]);
      }

      toast.success(
        selectedFiles.length === 1
          ? t('montages.photos.upload_success')
          : t('montages.photos.upload_success_multiple', { count: selectedFiles.length })
      );

      setShowUploadDialog(false);
      setSelectedFiles([]);
      setDescription('');
      onPhotosChange?.();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'));
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger an authenticated download. Reuses the cached blob from
   * AuthenticatedImage when present (fetchQuery dedupes against the same
   * query key), so the lightbox open + download = one network round-trip.
   */
  const handleDownload = async (photo: MontagePhoto) => {
    try {
      const endpoint = montagePhotoService.getPhotoDownloadPath(photo.id);
      const blob = await queryClient.fetchQuery({
        queryKey: queryKeys.montagePhotos.blob(endpoint),
        queryFn: () => apiClient.getBlob(endpoint),
        staleTime: 10 * 60 * 1000,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.original_file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      console.error('Failed to download photo:', error);
      toast.error(t('common.unknown_error'));
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await montagePhotoService.deletePhoto(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
      toast.success(t('montages.photos.delete_success'));
      onPhotosChange?.();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error(t('common.unknown_error'));
    }
  };

  const canAddMorePhotos = validationInfo
    ? photos.length < validationInfo.maxPhotosPerMontage
    : true;

  const remainingPhotos = validationInfo
    ? validationInfo.maxPhotosPerMontage - photos.length
    : 5;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            {t('montages.photos.title')}
            <span className="text-sm font-normal text-muted-foreground">
              ({photos.length}/{validationInfo?.maxPhotosPerMontage || 5})
            </span>
          </CardTitle>
          {canAddMorePhotos && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={validationInfo?.allowedExtensions.join(',') || '.jpg,.jpeg,.png,.webp'}
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('montages.photos.add_photo')}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">{t('montages.photos.no_photos')}</p>
            {canAddMorePhotos && (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('montages.photos.upload_first')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <AuthenticatedImage
                  endpoint={montagePhotoService.getPhotoDownloadPath(photo.id)}
                  alt={photo.original_file_name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-red-500/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}

            {canAddMorePhotos && (
              <div
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-muted/10 hover:bg-muted/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  {t('montages.photos.add_more', { count: remainingPhotos })}
                </span>
              </div>
            )}
          </div>
        )}

        {validationInfo && (
          <p className="text-xs text-muted-foreground mt-4">
            {t('montages.photos.validation_info', {
              maxSize: validationInfo.maxFileSizeMB,
              formats: validationInfo.allowedExtensions.join(', '),
            })}
          </p>
        )}
      </CardContent>

      <Dialog
        open={showUploadDialog}
        onOpenChange={(open) => {
          setShowUploadDialog(open);
          if (!open) {
            setDescription('');
            setSelectedFiles([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFiles.length === 1
                ? t('montages.photos.upload_photo')
                : t('montages.photos.upload_photos', { count: selectedFiles.length })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                    onClick={() =>
                      setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                    }
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                {t('common.description')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('montages.photos.description_placeholder')}
                aria-invalid={!description.trim() || undefined}
                aria-required="true"
                required
              />
              {!description.trim() && (
                <p className="text-xs text-destructive">
                  {t('montages.photos.description_required')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0 || !description.trim()}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {t('common.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-[85vw] w-[85vw] max-h-[90vh] h-auto p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
          {selectedPhoto && (
            <div className="relative">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 z-50 p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors shadow-md"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-zinc-800/50 min-h-[60vh]">
                  <AuthenticatedImage
                    endpoint={montagePhotoService.getPhotoDownloadPath(selectedPhoto.id)}
                    alt={selectedPhoto.original_file_name}
                    className="max-w-full max-h-[75vh] object-contain"
                    containerClassName="min-h-[60vh]"
                  />
                </div>

                <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedPhoto.original_file_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {montagePhotoService.formatFileSize(selectedPhoto.file_size)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedPhoto)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.download')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedPhoto.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
