/**
 * Composable pro flash messages v CMS
 * Perzistentní zprávy, které přežijí navigaci mezi stránkami
 */

export type FlashMessageType = 'success' | 'error' | 'warning' | 'info'

export interface FlashMessage {
  id: string
  type: FlashMessageType
  message: string
  timeout?: number // ms, 0 = nezmizí automaticky
}

// Výchozí timeout pro jednotlivé typy zpráv
const DEFAULT_TIMEOUTS: Record<FlashMessageType, number> = {
  success: 4000,
  error: 8000, // Chyby zobrazit déle
  warning: 6000,
  info: 5000
}

export function useFlashMessages() {
  // Použít useState pro perzistenci při navigaci
  const messages = useState<FlashMessage[]>('flashMessages', () => [])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  /**
   * Vygeneruje unikátní ID pro zprávu
   */
  const generateId = () => `flash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  /**
   * Odstraní zprávu podle ID
   */
  const removeMessage = (id: string) => {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    messages.value = messages.value.filter(m => m.id !== id)
  }

  /**
   * Vyčistí všechny zprávy
   */
  const clearAll = () => {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    messages.value = []
  }

  /**
   * Vyčistí zprávy určitého typu
   */
  const clearByType = (type: FlashMessageType) => {
    const toRemove = messages.value.filter(m => m.type === type)
    toRemove.forEach((m) => {
      const timer = timers.get(m.id)
      if (timer) {
        clearTimeout(timer)
        timers.delete(m.id)
      }
    })
    messages.value = messages.value.filter(m => m.type !== type)
  }

  /**
   * Přidá novou flash message
   */
  const addMessage = (
    type: FlashMessageType,
    message: string,
    options?: { timeout?: number; scrollToTop?: boolean }
  ) => {
    const id = generateId()
    const timeout = options?.timeout ?? DEFAULT_TIMEOUTS[type]

    const flashMessage: FlashMessage = {
      id,
      type,
      message,
      timeout
    }

    messages.value.push(flashMessage)

    // Scroll nahoru při přidání zprávy
    if (options?.scrollToTop !== false && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Auto-dismiss pokud je nastaven timeout
    if (timeout > 0) {
      const timer = setTimeout(() => {
        removeMessage(id)
      }, timeout)
      timers.set(id, timer)
    }

    return id
  }

  /**
   * Přidá success zprávu a vyčistí předchozí error zprávy
   */
  const success = (message: string, options?: { timeout?: number; scrollToTop?: boolean }) => {
    // Vyčistit všechny error zprávy při úspěchu
    clearByType('error')
    return addMessage('success', message, options)
  }

  /**
   * Přidá error zprávu
   */
  const error = (message: string, options?: { timeout?: number; scrollToTop?: boolean }) => {
    return addMessage('error', message, { timeout: 0, scrollToTop: true, ...options })
  }

  /**
   * Přidá warning zprávu
   */
  const warning = (message: string, options?: { timeout?: number; scrollToTop?: boolean }) => {
    return addMessage('warning', message, options)
  }

  /**
   * Přidá info zprávu
   */
  const info = (message: string, options?: { timeout?: number; scrollToTop?: boolean }) => {
    return addMessage('info', message, options)
  }

  return {
    messages: computed(() => messages.value),
    addMessage,
    removeMessage,
    clearAll,
    clearByType,
    success,
    error,
    warning,
    info
  }
}
