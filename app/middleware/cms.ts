/**
 * Middleware pro CMS sekci
 * Kontroluje přihlášení a přesměrovává na login
 */

export default defineNuxtRouteMiddleware(async (to) => {
  // Na login stránku pustíme vždy
  if (to.path === '/cms/login') {
    return
  }

  // Zkontrolovat přihlášení
  try {
    const { data } = await useFetch('/api/auth/me', {
      credentials: 'include'
    })

    if (!data.value) {
      return navigateTo('/cms/login')
    }
  } catch {
    return navigateTo('/cms/login')
  }
})
