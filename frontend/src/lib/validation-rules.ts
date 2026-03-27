/**
 * Validation rule factory functions that mirror backend FluentValidation rules.
 * Each function returns a ValidationRule: (value: string) => error i18n key | null.
 * null means the value is valid.
 */

export type ValidationRule = (value: string) => string | null

export const required = (messageKey: string): ValidationRule =>
  (value: string) => (!value || !value.trim()) ? messageKey : null

export const minLength = (min: number, messageKey: string): ValidationRule =>
  (value: string) => (value && value.trim().length < min) ? messageKey : null

export const maxLength = (max: number, messageKey: string): ValidationRule =>
  (value: string) => (value && value.length > max) ? messageKey : null

export const email = (messageKey: string): ValidationRule =>
  (value: string) => (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ? messageKey : null

export const matches = (regex: RegExp, messageKey: string): ValidationRule =>
  (value: string) => (value && !regex.test(value)) ? messageKey : null

export const matchesField = (getOtherValue: () => string, messageKey: string): ValidationRule =>
  (value: string) => (value !== getOtherValue()) ? messageKey : null

/**
 * Password validation: min 8 chars, uppercase, lowercase, digit, special char.
 * Returns first failing rule's message key, or null if all pass.
 */
export const passwordStrength = (): ValidationRule =>
  (value: string) => {
    if (!value) return null
    if (value.length < 8) return 'validation.password_min_length'
    if (!/[A-Z]/.test(value)) return 'validation.password_uppercase'
    if (!/[a-z]/.test(value)) return 'validation.password_lowercase'
    if (!/[0-9]/.test(value)) return 'validation.password_number'
    if (!/[^a-zA-Z0-9]/.test(value)) return 'validation.password_special'
    return null
  }

// Bulgarian-specific validators
export const bulgarianPhone = (messageKey: string): ValidationRule =>
  (value: string) => (value && !/^(\+359|0)\d{8,9}$/.test(value)) ? messageKey : null

export const bulstat = (messageKey: string): ValidationRule =>
  (value: string) => (value && !/^\d{9}(\d{4})?$/.test(value)) ? messageKey : null

export const vatNumber = (messageKey: string): ValidationRule =>
  (value: string) => (value && !/^BG\d{9,10}$/.test(value)) ? messageKey : null

export const postalCode = (messageKey: string): ValidationRule =>
  (value: string) => (value && !/^\d{4}$/.test(value)) ? messageKey : null

/**
 * For optional fields: wraps rules so they only run when the value is non-empty.
 */
export const optional = (...rules: ValidationRule[]): ValidationRule =>
  (value: string) => {
    if (!value || !value.trim()) return null
    for (const rule of rules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }
