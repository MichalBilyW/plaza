/**
 * Composable pro autentizaci v CMS
 * S podporou CSRF tokenů a auto-refresh
 */

import type { User } from '@/shared/types'

interface LoginResponse {
  user: User
  csrfToken: string
}

interface RefreshResponse {
  user: User
  csrfToken: string
}

export const useCmsAuth = () => {
  const user = useState<User | null>('cms-user', () => null)
  const isLoading = useState('cms-auth-loading', () => true)
  const csrfToken = useState<string | null>('csrf-token', () => null)

  // Získat CSRF token z cookie
  const getCsrfFromCookie = (): string | null => {
    if (import.meta.server) return null
    const match = document.cookie.match(/csrf_token=([^;]+)/)
    return match?.[1] ?? null
  }

  // Fetch s CSRF tokenem
  const secureFetch = async <T>(url: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    headers?: Record<string, string>
  } = {}): Promise<T> => {
    const token = csrfToken.value || getCsrfFromCookie()

    const result = await $fetch<T>(url, {
      method: options.method,
      body: options.body as Record<string, unknown> | undefined,
      credentials: 'include',
      headers: {
        ...options.headers,
        ...(token ? { 'X-CSRF-Token': token } : {}),
      },
    })
    return result as T
  }

  const fetchUser = async () => {
    isLoading.value = true
    try {
      // Používáme $fetch místo useFetch aby se necachovala data
      const userData = await $fetch<User>('/api/auth/me', {
        credentials: 'include'
      })
      user.value = userData

      // Načíst CSRF z cookie pokud existuje
      if (import.meta.client) {
        csrfToken.value = getCsrfFromCookie()
      }
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      credentials: 'include'
    })
    user.value = response.user
    csrfToken.value = response.csrfToken
    return response
  }

  const logout = async () => {
    try {
      await secureFetch('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      user.value = null
      csrfToken.value = null
      await navigateTo('/cms/login')
    }
  }

  // Refresh access tokenu
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await $fetch<RefreshResponse>('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })
      user.value = response.user
      csrfToken.value = response.csrfToken
      return true
    } catch {
      user.value = null
      csrfToken.value = null
      return false
    }
  }

  // Seznam aktivních sessions
  const getSessions = async () => {
    return secureFetch<{
      sessions: Array<{
        id: string
        userAgent?: string
        ipAddress?: string
        lastActivityAt?: string
        createdAt: string
        isCurrent: boolean
      }>
      currentSessionId: string
    }>('/api/auth/sessions')
  }

  // Odhlásit konkrétní session
  const revokeSession = async (sessionId: string) => {
    return secureFetch<{ success: boolean }>(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  // Odhlásit všechny ostatní sessions
  const revokeAllOtherSessions = async () => {
    return secureFetch<{ success: boolean; revokedCount: number }>('/api/auth/sessions', {
      method: 'DELETE',
    })
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEditor = computed(() => user.value?.role === 'editor' || isAdmin.value)

  return {
    user,
    isLoading,
    isAdmin,
    isEditor,
    csrfToken,
    fetchUser,
    login,
    logout,
    refreshToken,
    secureFetch,
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
  }
}
