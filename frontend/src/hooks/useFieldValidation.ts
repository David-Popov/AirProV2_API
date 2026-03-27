import { useState, useCallback } from 'react'
import type { FieldStatus } from '@/components/shared/FieldMessage'
import type { ValidationRule } from '@/lib/validation-rules'

export interface FieldState {
  status: FieldStatus
  message: string
}

const IDLE_STATE: FieldState = { status: 'idle', message: '' }
const VALID_STATE: FieldState = { status: 'valid', message: 'validation.field_valid' }

type RulesMap<T> = Partial<Record<keyof T, ValidationRule[]>>

export function useFieldValidation<T extends Record<string, unknown>>(rules: RulesMap<T>) {
  const [fields, setFields] = useState<Record<string, FieldState>>({})

  const validateField = useCallback((name: string, value: string): boolean => {
    const fieldRules = rules[name as keyof T]
    if (!fieldRules || fieldRules.length === 0) {
      setFields(prev => ({ ...prev, [name]: VALID_STATE }))
      return true
    }

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        setFields(prev => ({ ...prev, [name]: { status: 'invalid', message: error } }))
        return false
      }
    }

    setFields(prev => ({ ...prev, [name]: VALID_STATE }))
    return true
  }, [rules])

  const validateAll = useCallback((formData: T): boolean => {
    let allValid = true
    const newFields: Record<string, FieldState> = {}

    for (const [name, fieldRules] of Object.entries(rules)) {
      if (!fieldRules || fieldRules.length === 0) continue
      const value = String(formData[name] ?? '')
      let fieldValid = true

      for (const rule of fieldRules) {
        const error = rule(value)
        if (error) {
          newFields[name] = { status: 'invalid', message: error }
          fieldValid = false
          allValid = false
          break
        }
      }

      if (fieldValid) {
        newFields[name] = VALID_STATE
      }
    }

    setFields(prev => ({ ...prev, ...newFields }))
    return allValid
  }, [rules])

  const setFieldState = useCallback((name: string, state: FieldState) => {
    setFields(prev => ({ ...prev, [name]: state }))
  }, [])

  const resetField = useCallback((name: string) => {
    setFields(prev => ({ ...prev, [name]: IDLE_STATE }))
  }, [])

  const resetAll = useCallback(() => {
    setFields({})
  }, [])

  const getFieldProps = useCallback((name: string): FieldState => {
    return fields[name] || IDLE_STATE
  }, [fields])

  return {
    fields,
    validateField,
    validateAll,
    setFieldState,
    resetField,
    resetAll,
    getFieldProps,
  }
}
