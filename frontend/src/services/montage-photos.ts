import { apiClient } from './api';
import i18n from '@/i18n';
import type { MontagePhoto, PhotoValidationInfo } from '@/types';

const BASE_URL = '/MontagePhotos';

export const montagePhotoService = {
  /**
   * Upload a single photo for a montage
   */
  async uploadPhoto(
    montageId: string,
    file: File,
    description?: string,
    displayOrder: number = 0
  ): Promise<MontagePhoto> {
    const additionalData: Record<string, string | number> = {
      displayOrder,
    };
    if (description) {
      additionalData.description = description;
    }

    return apiClient.uploadFile<MontagePhoto>(
      `${BASE_URL}/montage/${montageId}`,
      file,
      additionalData
    );
  },

  /**
   * Upload multiple photos for a montage (batch upload)
   */
  async uploadPhotos(
    montageId: string,
    files: File[],
    description?: string
  ): Promise<MontagePhoto[]> {
    const additionalData: Record<string, string | number> = {};
    if (description) {
      additionalData.description = description;
    }

    return apiClient.uploadFiles<MontagePhoto[]>(
      `${BASE_URL}/montage/${montageId}/batch`,
      files,
      additionalData
    );
  },

  /**
   * Get all photos for a montage
   */
  async getPhotosByMontage(montageId: string): Promise<MontagePhoto[]> {
    return apiClient.get<MontagePhoto[]>(`${BASE_URL}/montage/${montageId}`);
  },

  /**
   * Get a single photo by ID
   */
  async getPhotoById(photoId: string): Promise<MontagePhoto> {
    return apiClient.get<MontagePhoto>(`${BASE_URL}/${photoId}`);
  },

  /**
   * Get the full download URL for a photo (kept for cases where an absolute
   * URL is required — note that the endpoint is JWT-protected, so direct
   * `<img src>` / `<a href>` against this URL will fail; use
   * `getPhotoDownloadPath` with `AuthenticatedImage` or `apiClient.getBlob`.
   */
  getPhotoDownloadUrl(photoId: string): string {
    return `${apiClient.getBaseUrl()}${BASE_URL}/${photoId}/download`;
  },

  /**
   * Get the relative endpoint path for a photo download. Use this with
   * `AuthenticatedImage` or `apiClient.getBlob` — both go through the JWT
   * pipeline and the React Query cache, so a single download is shared
   * between thumbnail, lightbox, and the download button.
   */
  getPhotoDownloadPath(photoId: string): string {
    return `${BASE_URL}/${photoId}/download`;
  },

  /**
   * Update photo metadata (description, display order)
   */
  async updatePhoto(
    photoId: string,
    description?: string,
    displayOrder: number = 0
  ): Promise<MontagePhoto> {
    return apiClient.put<MontagePhoto>(`${BASE_URL}/${photoId}`, {
      description,
      displayOrder,
    });
  },

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${photoId}`);
  },

  /**
   * Get validation info for photo uploads
   */
  async getValidationInfo(): Promise<PhotoValidationInfo> {
    return apiClient.get<PhotoValidationInfo>(`${BASE_URL}/validation-info`);
  },

  /**
   * Client-side validation before upload
   */
  validateFile(file: File, validationInfo: PhotoValidationInfo): { isValid: boolean; error?: string } {
    if (file.size > validationInfo.maxFileSizeBytes) {
      return {
        isValid: false,
        error: i18n.t('montages.photos.error_file_size', { maxSize: validationInfo.maxFileSizeMB }) as string,
      };
    }

    if (!validationInfo.allowedContentTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: i18n.t('montages.photos.error_file_type', { types: validationInfo.allowedExtensions.join(', ') }) as string,
      };
    }

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validationInfo.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: i18n.t('montages.photos.error_file_extension', { extensions: validationInfo.allowedExtensions.join(', ') }) as string,
      };
    }

    return { isValid: true };
  },

  /**
   * Validate multiple files
   */
  validateFiles(
    files: File[],
    validationInfo: PhotoValidationInfo,
    currentPhotoCount: number = 0
  ): { isValid: boolean; error?: string } {
    const totalAfterUpload = currentPhotoCount + files.length;
    if (totalAfterUpload > validationInfo.maxPhotosPerMontage) {
      const remaining = validationInfo.maxPhotosPerMontage - currentPhotoCount;
      return {
        isValid: false,
        error: i18n.t('montages.photos.error_too_many', {
          count: files.length,
          remaining,
          max: validationInfo.maxPhotosPerMontage,
        }) as string,
      };
    }

    for (const file of files) {
      const result = this.validateFile(file, validationInfo);
      if (!result.isValid) {
        return {
          isValid: false,
          error: i18n.t('montages.photos.error_file_named', { name: file.name, error: result.error }) as string,
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
