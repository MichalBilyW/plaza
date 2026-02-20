/**
 * Middleware pro CMS sekci
 * Kontroluje přihlášení a přesměrovává na login
 */

import type { User } from '@/shared/types'

export default defineNuxtRouteMiddleware(async (to) => {
  // Na login stránku pustíme vždy
  if (to.path === '/cms/login') {
    return
  }

  // Získat přístup k user state z composable
  const user = useState<User | null>('cms-user')

  // Při SSR musíme předat cookies z requestu
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}

  // Zkontrolovat přihlášení a zároveň nastavit user state
  try {
    const userData = await $fetch<User>('/api/auth/me', {
      credentials: 'include',
      headers
    })

    if (!userData) {
      user.value = null
      return navigateTo('/cms/login')
    }

    // Nastavit user state pro celou aplikaci
    user.value = userData

    // Kontrola oprávnění pro admin-only stránky
    if (to.path.startsWith('/cms/spravci') && userData.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Nemáte oprávnění k zobrazení této stránky'
      })
    }
  } catch (error) {
    // Re-throw pokud je to naše 403 chyba
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    user.value = null
    return navigateTo('/cms/login')
  }
})
