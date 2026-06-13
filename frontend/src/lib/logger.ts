/**
 * Dev-only console wrapper. Silent in production builds so diagnostic logging
 * never ships to end users, while staying fully available during development.
 *
 * Swap `error` for a real error-reporting sink (Sentry, etc.) later without
 * touching call sites.
 */
const isDev = import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args)
  },
}
