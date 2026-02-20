/**
 * Returns i18n translation keys for each password rule that fails.
 * Caller maps keys through t() from useTranslation.
 */
export function validatePasswordRules(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('validation.password_min_length')
  if (!/[A-Z]/.test(password)) errors.push('validation.password_uppercase')
  if (!/[a-z]/.test(password)) errors.push('validation.password_lowercase')
  if (!/[0-9]/.test(password)) errors.push('validation.password_number')
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push('validation.password_special')
  return errors
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
