# Composables a helpery

Composables jsou umístěny v `app/composables/`. Každý composable je auto-importován Nuxtem – není potřeba explicitní import.

---

## Autentizace a CMS

### `useCmsAuth`

**Soubor:** `app/composables/useCmsAuth.ts`

Centrální composable pro auth stav v CMS.

```typescript
const { user, isLoading, csrfToken, login, logout, fetchUser, secureFetch } = useCmsAuth()
```

| Hodnota / Metoda | Typ | Popis |
|---|---|---|
| `user` | `Ref<User \| null>` | Přihlášený uživatel (`useState('cms-user')`) |
| `isLoading` | `Ref<boolean>` | Probíhá načítání uživatele |
| `csrfToken` | `Ref<string \| null>` | Aktuální CSRF token |
| `login(email, password)` | `async` | Přihlásí, uloží user + csrfToken |
| `logout()` | `async` | Odhlásí a přesměruje na `/cms/login` |
| `fetchUser()` | `async` | Načte profil z `/api/auth/me` |
| `secureFetch(url, options)` | `async` | Fetch s CSRF tokenem, při 403 auto-retry |

**Sdílený stav:** `useState('cms-user')` – konzistentní přes všechny komponenty.

**CSRF mechanismus:** `secureFetch` čte token z `csrfToken` state nebo ze cookie `csrf_token`, přidá ho do `X-CSRF-Token` headeru. Při 403 odpovědi zavolá `fetchUser()` a zopakuje request (automatická CSRF token obnova).

---

## SEO

### `usePlazaSeo`

**Soubor:** `app/composables/usePlazaSeo.ts`

Nastaví SEO meta tagy pro stránku.

```typescript
usePlazaSeo({
  title: 'H&M',
  description: 'Módní řetězec...',
  image: '/api/uploads/uuid.jpg',
  url: 'https://ocplazaliberec.cz/obchody/hm',
  type: 'website',  // nebo 'article'
  noIndex: false,
})
```

Nastavuje: `title`, `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `twitter:card`, `robots`, canonical URL.

- `title === 'OC Plaza Liberec'` → fullTitle = samotný název (bez sufixu)
- Jinak: `H&M | OC Plaza Liberec`
- Fallback OG image: `${baseUrl}/images/og.jpg`

---

## Flash zprávy

### `useFlashMessages`

**Soubor:** `app/composables/useFlashMessages.ts`

Flash zprávy přežívají navigaci (uloženy v `useState`).

```typescript
const { messages, addMessage, removeMessage, clearAll } = useFlashMessages()

addMessage('success', 'Obchod byl uložen')
addMessage('error', 'Nepodařilo se uložit', { timeout: 0 })  // 0 = nezmizí
```

Typy a výchozí timeouty:

| Typ | Timeout |
|---|---|
| `success` | 4 000 ms |
| `error` | 8 000 ms |
| `warning` | 6 000 ms |
| `info` | 5 000 ms |

---

## Formuláře

### `useFormErrors`

**Soubor:** `app/composables/useFormErrors.ts`

Zpracovává API chyby a mapuje je na pole formuláře.

```typescript
const { errors, generalError, handleApiError, setFieldError, clearErrors } = useFormErrors()

try {
  await apiClient.shops.create(data)
} catch (err) {
  const message = handleApiError(err)  // extrahuje field errors z ApiErrorResponse
}
```

- `errors` – pole field chyb, mapováno na formulář (`errors.value['email']`)
- `generalError` – obecná chybová zpráva pro zobrazení nad formulářem
- `handleApiError(err)` – zpracuje `FetchError`, extrahuje `fields` z API response

---

## Filtrování a navigace

### `useFilterPersistence`

**Soubor:** `app/composables/useFilterPersistence.ts`

Persistuje filtry tabulek přes `sessionStorage` a URL query parametry.

```typescript
const { loadFilters, syncFilters, clearFilters } = useFilterPersistence('shops')

// Načte filtry z URL nebo sessionStorage
const filters = loadFilters({ page: 1, search: '', categoryId: '' })

// Synchronizuje do URL a sessionStorage
syncFilters(filters)
```

- Priorita: URL query parametry > sessionStorage > defaultní hodnoty
- Klíč v sessionStorage: `plaza-filters-{pageKey}`
- Po redirectu na detail a zpět zachová filtry

---

## Tabulky

### `useTableSort`

**Soubor:** `app/composables/useTableSort.ts`

Klientské řazení tabulek v CMS s 3-stavovým cyklem (asc → desc → reset).

```typescript
const { sortedItems, toggleSort, getSortIcon } = useTableSort(items, { field: 'name', direction: 'asc' })
```

- `toggleSort(field)` – cykluje stavy
- `getSortIcon(field)` – vrátí `'asc'`, `'desc'` nebo `null`
- Podporuje vnořené pole (speciální case pro `floor.name`)

---

## Interaktivní mapa

### `useInteractiveMap`

**Soubor:** `app/composables/useInteractiveMap.ts`

Správa interaktivní SVG mapy obchodního centra.

```typescript
const {
  mapData, floors, currentFloor, currentUnits, state,
  setCurrentFloor, handleUnitHover, handleUnitClick
} = useInteractiveMap({ initialFloorId: '...' })
```

- Načítá data z `GET /api/map/units` (přes `useFetch` s key `map-units`)
- Data jsou prefetchována na serveru (SSR payload) – mapa se zobrazí ihned bez flash
- `state.currentFloorId` – aktivní patro
- `state.hoveredUnit` – jednotka v hover popupu (desktop) / tap popupu (mobile)
- `unitsMap` – `Map<unitCode, MapUnit>` pro O(1) přístup
- `handleUnitClick` → naviguje na `/obchody/:slug` a trackuje do dataLayer

### `useMapZoom`

**Soubor:** `app/composables/useMapZoom.ts`

Zoom/pan kontrola přes `@panzoom/panzoom`.

- Max zoom: 5×, krok: 0.5×
- Desktop: Ctrl/Cmd + kolečko myši, drag při přiblížení
- Mobile: 1 prst = scroll stránky, 2 prsty = pinch-zoom
- Na mobilu (< 768px) výchozí zoom 2×
- `isZoomed`, `canZoomIn`, `canZoomOut` – computed pro UI stav

---

## Modaly

Projekt používá modularizované modaly pro veřejný web. Každý modal má vlastní composable s globálním stavem.

### `useOpeningHoursModal`

**Soubor:** `app/composables/useOpeningHoursModal.ts`

```typescript
const { isModalOpen, openModal, closeModal, toggleModal } = useOpeningHoursModal()
```

Sdílený `ref(false)` mimo composable funkci → globální singleton stav.  
Při `openModal()` automaticky trackuje `trackModalOpen('opening_hours')`.

### `useContactsModal`, `useParkingModal`, `useServiceModal`, `useEventModal`

**Soubory:** `app/composables/useContactsModal.ts`, `useParkingModal.ts`, `useServiceModal.ts`, `useEventModal.ts`

Stejný pattern – globální singleton stav + DataLayer tracking.  
`useServiceModal` a `useEventModal` nesou i data zobrazené položky.

---

## Analytics a tracking

### `useDataLayer`

**Soubor:** `app/composables/useDataLayer.ts`

Centrální wrapper pro Google Tag Manager `window.dataLayer`.

```typescript
const {
  trackShopClick, trackShopView, trackEventClick,
  trackContactClick, trackSearch, trackFilterApply,
  trackMapFloorSelect, trackMapUnitClick, trackModalOpen
} = useDataLayer()
```

- Automaticky přeskakuje tracking na CMS stránkách (`/cms/*`)
- Automaticky přeskakuje na serveru (`import.meta.server`)
- Inicializace `window.dataLayer = window.dataLayer || []`

---

## Cookie consent

### `useCookieConsent`

**Soubor:** `app/composables/useCookieConsent.ts`

Wrapper pro Silktide Cookie Manager.

```typescript
const { hasConsent, hasGivenInitialConsent, openCookieSettings, revokeAllConsent } = useCookieConsent()
```

- `hasConsent(cookieType)` – čte `localStorage.silktideCookieChoice_{type}`
- `openCookieSettings()` – otevře modal správy cookies
- `revokeAllConsent()` – odvolá souhlas, aktualizuje GTM Consent Mode v2, reload stránky

---

## HTML sanitizace

### `useSanitizeHtml`

**Soubor:** `app/composables/useSanitizeHtml.ts`

```typescript
const { sanitize } = useSanitizeHtml()
const safeHtml = sanitize(dirtyHtml)
```

- Používá DOMPurify
- Na serveru (SSR) vrátí raw HTML bez sanitizace (DOMPurify vyžaduje DOM)
- Povolené tagy: `p, br, b, strong, i, em, h1-h6, ul, ol, li, a, img, table, ...`

---

## Globální loading

### `useGlobalLoading`

**Soubor:** `app/composables/useGlobalLoading.ts`

Sleduje počet aktivních requestů a navigací pro loading indikátor.

```typescript
const { isLoading, startRequest, finishRequest, startRoute, finishRoute } = useGlobalLoading()
```

- `requestCount` + `routeCount` → `isLoading = computed(() => count > 0)`
- Fetch wrapper v `plugins/loading-indicator.client.ts` obaluje `globalThis.fetch`
- Nuxt hooks `page:start` / `page:finish` inkrementují/dekrementují `routeCount`

---

## Server utilities

### `server/utils/auth.ts` – přehled exportů

| Export | Popis |
|---|---|
| `hashPassword(password)` | bcrypt hash (rounds=12) |
| `verifyPassword(password, hash)` | bcrypt compare |
| `generateAccessToken(user, sessionId)` | JWT sign |
| `verifyAccessToken(token)` | JWT verify → payload |
| `generateRefreshToken()` | crypto.randomBytes(64).hex |
| `getRefreshTokenExpiry()` | now + 7 dní |
| `setAuthCookies(event, access, refresh)` | Nastaví cookies |
| `clearAuthCookies(event)` | Smaže cookies |
| `getAccessToken(event)` | Cookie → header fallback |
| `getRefreshTokenFromCookie(event)` | Cookie |
| `getSessionInfo(event)` | `{ userAgent, ipAddress }` |
| `requireAuth(event)` | AuthUser nebo 401 |
| `requireEditor(event)` | editor/admin/superadmin nebo 403 |
| `requireAdmin(event)` | admin/superadmin nebo 403 |
| `requireSuperAdmin(event)` | superadmin nebo 403 |

### `server/utils/slug.ts`

```typescript
generateSlug(text: string): string
generateUniqueSlug(text, checkExists, currentId?): Promise<string>
```

- Převede českou diakritiku na ASCII
- Nahradí mezery pomlčkami
- Pokud slug existuje, přidá číslo (např. `hm-2`)

### `server/utils/errors.ts`

```typescript
defineApiHandler(handler)  // wrapper s jednotným error handlerem
createValidationError(message, fields?)
createNotFoundError(resourceName)
createUnauthorizedError()
createForbiddenError()
```

`defineApiHandler` obaluje handler, chytí `ZodError`, `ApiError` i neočekávané chyby a převede je na konzistentní JSON response.
