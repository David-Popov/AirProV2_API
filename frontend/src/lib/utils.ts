import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(errorData: unknown): string {
  if (!errorData) return 'An error occurred';
  
  // Handle string responses
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  // Handle object responses
  if (typeof errorData === 'object') {
    const err = errorData as Record<string, unknown>;
    
    // Handle { message: "..." }
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }
    
    // Handle { errors: ["...", "..."] } (standard validation errors)
    if (Array.isArray(err.errors)) {
      return err.errors.filter(e => typeof e === 'string').join('. ');
    }
    
    // Handle { errors: { field: ["...", "..."] } } (ASP.NET model validation)
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
    
    // Handle { error: "..." } 
    if (err.error && typeof err.error === 'string') {
      return err.error;
    }
    
    // Handle ASP.NET Identity errors: [{ description: "..." }, ...]
    if (Array.isArray(errorData)) {
      const descriptions = (errorData as Array<{description?: string}>)
        .filter(e => e.description)
        .map(e => e.description);
      if (descriptions.length > 0) {
        return descriptions.join('. ');
      }
    }
    
    // Handle { title: "...", detail: "..." } (Problem Details)
    if (err.title && typeof err.title === 'string') {
      const detail = err.detail && typeof err.detail === 'string' ? `: ${err.detail}` : '';
      return `${err.title}${detail}`;
    }
  }
  
  return 'An error occurred';
}
