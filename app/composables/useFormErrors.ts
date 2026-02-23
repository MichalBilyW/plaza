/**
 * Composable pro zpracování API chyb ve formulářích
 * Extrahuje chyby z API response a mapuje je na pole formuláře
 */

import type { ApiErrorResponse } from '@/shared/types'

export interface FormErrors {
  [key: string]: string | undefined
}

interface FetchErrorData {
  data?: ApiErrorResponse
}

export function useFormErrors() {
  const errors = ref<FormErrors>({})
  const generalError = ref<string | null>(null)

  /**
   * Vyčistí všechny chyby
   */
  const clearErrors = () => {
    errors.value = {}
    generalError.value = null
  }

  /**
   * Nastaví chybu pro konkrétní pole
   */
  const setFieldError = (field: string, message: string) => {
    errors.value[field] = message
  }

  /**
   * Zpracuje chybu z API a extrahuje pole errors
   */
  const handleApiError = (error: unknown): string => {
    clearErrors()

    // Extrahovat data z FetchError
    const fetchError = error as { data?: FetchErrorData['data']; message?: string }
    const apiError = fetchError?.data as ApiErrorResponse | undefined

    if (apiError) {
      // Nastavit field-level chyby
      if (apiError.fields) {
        for (const [field, message] of Object.entries(apiError.fields)) {
          errors.value[field] = message
        }
      }

      // Vrátit hlavní zprávu
      generalError.value = apiError.message
      return apiError.message
    }

    // Fallback na obecnou chybu
    const message = fetchError?.message || 'Neočekávaná chyba'
    generalError.value = message
    return message
  }

  /**
   * Zjistí, jestli pole má chybu
   */
  const hasError = (field: string): boolean => {
    return !!errors.value[field]
  }

  /**
   * Vrátí chybu pro pole
   */
  const getError = (field: string): string | undefined => {
    return errors.value[field]
  }

  /**
   * Scrolluje na první element s chybou ve formuláři
   */
  const scrollToFirstError = () => {
    nextTick(() => {
      // Najdi první element s chybovou třídou nebo data-error atributem
      const errorElement = document.querySelector(
        '[data-error="true"], .border-red-500, .text-red-600'
      ) as HTMLElement | null

      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        // Pokus se focusnout input pokud je to input element
        const input = errorElement.closest('div')?.querySelector('input, select, textarea') as HTMLElement | null
        if (input) {
          input.focus()
        }
      }
    })
  }

  return {
    errors,
    generalError,
    clearErrors,
    setFieldError,
    handleApiError,
    hasError,
    getError,
    scrollToFirstError,
  }
}
