import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(errorData: unknown): string {
  if (!errorData) return 'An error occurred';
  
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  if (typeof errorData === 'object') {
    const err = errorData as Record<string, unknown>;
    
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }
    
    if (Array.isArray(err.errors)) {
      return err.errors.filter(e => typeof e === 'string').join('. ');
    }
    
    if (err.errors && typeof err.errors === 'object' && !Array.isArray(err.errors)) {
      const fieldErrors = err.errors as Record<string, string[]>;
      const messages: string[] = [];
      for (const field in fieldErrors) {
        if (Array.isArray(fieldErrors[field])) {
          messages.push(...fieldErrors[field]);
        }
      }
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
    
    if (err.error && typeof err.error === 'string') {
      return err.error;
    }
    
    if (Array.isArray(errorData)) {
      const descriptions = (errorData as Array<{description?: string}>)
        .filter(e => e.description)
        .map(e => e.description);
      if (descriptions.length > 0) {
        return descriptions.join('. ');
      }
    }
    
    if (err.title && typeof err.title === 'string') {
      const detail = err.detail && typeof err.detail === 'string' ? `: ${err.detail}` : '';
      return `${err.title}${detail}`;
    }
  }
  
  return 'An error occurred';
}
