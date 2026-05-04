# Composables a helpery

Composables jsou v `app/composables/` a Nuxt je auto-importuje. Tento dokument popisuje aktualni verejne API jednotlivych composables a souvisejicich helperu kveten 2026.

---

## Prehled souboru

| Soubor | Ucel |
|---|---|
| `useCmsAuth.ts` | CMS autentizace, role, CSRF, sessions |
| `usePlazaSeo.ts` | SEO meta tagy |
| `useJsonLd.ts` | schema.org JSON-LD |
| `useFlashMessages.ts` | globalni flash zpravy |
| `useFormErrors.ts` | zpracovani API chyb ve formularich |
| `useFilterPersistence.ts` | persistovani filtru v URL/sessionStorage |
| `useTableSort.ts` | klientské razeni tabulek |
| `useInteractiveMap.ts` | data a interakce verejne mapy |
| `useMapZoom.ts` | pan/zoom ovladani mapy |
| `useMapLogoGeometry.ts` | vypocet pozic log v SVG mape |
| `useMapExport.ts` | export mapy do SVG/PDF |
| `useOpeningHoursStatus.ts` | stav oteviraci doby v prazskem case |
| modal composables | globalni stav modalu |
| `useDataLayer.ts` | GTM dataLayer eventy |
| `useCookieConsent.ts` | Silktide cookie consent wrapper |
| `useSanitizeHtml.ts` | DOMPurify sanitizace HTML |
| `useGlobalLoading.ts` | globalni loading indicator |

---

## `useCmsAuth`

Soubor: `app/composables/useCmsAuth.ts`

Centralni CMS auth composable. Stav je sdileny pres `useState`.

```ts
const {
  user,
  isLoading,
  isSuperAdmin,
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
} = useCmsAuth()
```

| Export | Popis |
|---|---|
| `user` | prihlaseny CMS uzivatel nebo `null` |
| `isLoading` | nacitani auth stavu |
| `isSuperAdmin` | role `superadmin` |
| `isAdmin` | role `admin` nebo `superadmin` |
| `isEditor` | role `editor`, `admin` nebo `superadmin` |
| `csrfToken` | aktualni CSRF token |
| `fetchUser()` | nacte `/api/auth/me` |
| `login(email, password)` | prihlasi uzivatele |
| `logout()` | odhlasi aktualni session a naviguje na `/cms/login` |
| `refreshToken()` | obnovi access token pres refresh token |
| `secureFetch(url, options)` | `$fetch` s credentials a `X-CSRF-Token` |
| `getSessions()` | nacte aktivni sessions |
| `revokeSession(sessionId)` | odhlasi jednu session |
| `revokeAllOtherSessions()` | odhlasi ostatni sessions |

`secureFetch()` pri 403 zavola `fetchUser()` a request jednou zopakuje. Prakticky to resi obnovu CSRF tokenu.

---

## `usePlazaSeo`

Soubor: `app/composables/usePlazaSeo.ts`

Nastavuje SEO meta tagy, Open Graph, Twitter card, canonical URL a robots.

```ts
usePlazaSeo({
  title: 'H&M',
  description: 'Módní obchod v OC Plaza Liberec',
  image: '/api/uploads/uuid.jpg',
  url: 'https://ocplazaliberec.cz/obchody/hm',
  type: 'website',
  noIndex: false,
})
```

Pravidla:

- pokud je title `OC Plaza Liberec`, nepřidává se suffix,
- jinak se vytvori format `{title} | OC Plaza Liberec`,
- fallback OG obrazek je `/images/og.jpg`,
- `noIndex: true` nastavi robots noindex.

---

## `useJsonLd`

Soubor: `app/composables/useJsonLd.ts`

Vklada schema.org JSON-LD do `<head>` pres `useHead`.

```ts
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ShoppingCenter',
  name: 'OC Plaza Liberec',
})
```

Pomocne exporty:

| Export | Popis |
|---|---|
| `openingHoursToSchemaSpec(hours)` | prevede oteviraci dobu na schema.org format |
| `buildBreadcrumbList(items)` | vytvori `BreadcrumbList` |

---

## `useFlashMessages`

Soubor: `app/composables/useFlashMessages.ts`

Globalni flash zpravy pres `useState`.

```ts
const { messages, addMessage, removeMessage, clearAll } = useFlashMessages()

addMessage('success', 'Obchod byl ulozen')
addMessage('error', 'Nepodarilo se ulozit', { timeout: 0 })
```

Default timeouty:

| Typ | Timeout |
|---|---:|
| `success` | 4 000 ms |
| `error` | 8 000 ms |
| `warning` | 6 000 ms |
| `info` | 5 000 ms |

`timeout: 0` znamena, ze zprava nezmizi automaticky.

---

## `useFormErrors`

Soubor: `app/composables/useFormErrors.ts`

Zpracovava API chyby a mapuje field errors do formularu.

```ts
const {
  errors,
  generalError,
  handleApiError,
  setFieldError,
  clearErrors,
} = useFormErrors()
```

Pouziti:

- `errors.value[field]` pro chybu konkretniho pole,
- `generalError` pro obecnou chybu nad formularem,
- `handleApiError(err)` umi extrahovat `fields` z API error response.

---

## `useFilterPersistence`

Soubor: `app/composables/useFilterPersistence.ts`

Udrzuje filtry seznamu mezi URL query parametry a `sessionStorage`.

```ts
const { loadFilters, syncFilters, clearFilters } = useFilterPersistence('shops')

const filters = loadFilters({ page: 1, search: '', categoryId: '' })
syncFilters(filters)
```

Priorita:

1. URL query,
2. `sessionStorage`,
3. defaultni hodnoty.

Klic v sessionStorage:

```text
plaza-filters-{pageKey}
```

---

## `useTableSort`

Soubor: `app/composables/useTableSort.ts`

Klientské razeni tabulek s cyklem `asc -> desc -> reset`.

```ts
const { sortedItems, sortState, toggleSort, getSortIcon } = useTableSort(items)
```

Podporuje bezna pole a specialni case pro `floor.name`.

---

## `useInteractiveMap`

Soubor: `app/composables/useInteractiveMap.ts`

Nacita data verejne mapy a drzi stav aktivniho patra, hoveru a vybrane jednotky.

```ts
const {
  mapData,
  floors,
  currentFloor,
  currentUnits,
  state,
  setCurrentFloor,
  handleUnitHover,
  handleUnitClick,
} = useInteractiveMap()
```

Vlastnosti:

- data bere z `GET /api/map/units`,
- pouziva `useFetch` se SSR payloadem,
- `unitsMap` dava rychly pristup podle `unitCode`,
- klik na obsazenou prodejni jednotku naviguje na detail obchodu,
- udalosti posila do dataLayer.

---

## `useMapZoom`

Soubor: `app/composables/useMapZoom.ts`

Pan/zoom mapa pres `@panzoom/panzoom`.

Chovani:

- max zoom 5x,
- krok zoomu 0.5x,
- desktop: Ctrl/Cmd + kolecko,
- mobile: pinch zoom dvema prsty,
- pod 768 px je vychozi zoom 2x.

Exporty zahrnuji stav typu `isZoomed`, `canZoomIn`, `canZoomOut` a ovladaci funkce pro UI.

---

## `useMapLogoGeometry`

Soubor: `app/composables/useMapLogoGeometry.ts`

Pocita umisteni log obchodů uvnitr SVG jednotek.

Pouziva se ve dvou rezimech:

| Rezim | Chovani |
|---|---|
| `web` | u malych jednotek muze zobrazit inicialy misto loga |
| `export` | pokud obchod ma logo, export ho vykresli vzdy |

Vypocet potrebuje zivy SVG element v DOM, protoze pouziva SVG geometricke API jako `getTotalLength()`, `getCTM()` a `baseVal`.

---

## `useMapExport`

Soubor: `app/composables/useMapExport.ts`

Exportuje mapu patra do SVG nebo PDF.

```ts
const { buildExportSvg, downloadSvg, downloadPdf, exportFloor } = useMapExport()
```

Podporovane formaty:

| Format | Popis |
|---|---|
| `svg` | standalone SVG s mapou, logy, hlavickou a seznamem obchodů |
| `pdf` | rasterizace SVG do canvasu a vlozeni PNG do jsPDF |

Moznosti exportu:

```ts
{
  showPlazaLogo: true,
  showHeader: true,
  showShopList: true,
  mapOnly: false,
}
```

PDF podporuje formaty `a4` a `a3`, orientace je landscape.

---

## `useOpeningHoursStatus`

Soubor: `app/composables/useOpeningHoursStatus.ts`

Vyhodnocuje, zda je centrum nebo obchod prave otevreny. Pouziva prazsky cas pres `shared/utils/pragueTime.ts`, takze neni zavisly jen na timezone serveru.

```ts
const {
  currentDate,
  currentDay,
  todaySpecialHours,
  todayOpeningHours,
  isOpen,
  specialNote,
  getDayLabel,
  isToday,
  isSpecialHoursActive,
  isSpecialHoursCurrentOrFuture,
} = useOpeningHoursStatus(() => openingHours, () => specialOpeningHours)
```

Podporuje:

- beznou tydenni oteviraci dobu,
- specialni oteviraci dobu pro konkretni datum,
- specialni oteviraci dobu pro rozsah dat,
- intervaly pres pulnoc.

---

## Modal composables

Soubory:

- `useOpeningHoursModal.ts`
- `useContactsModal.ts`
- `useParkingModal.ts`
- `useServiceModal.ts`
- `useEventModal.ts`

Pouzivaji singleton stav mimo composable funkci, takze modal je globalni v ramci aplikace.

Typicky pattern:

```ts
const { isModalOpen, openModal, closeModal, toggleModal } = useOpeningHoursModal()
```

`useServiceModal` a `useEventModal` nesou i data zobrazene sluzby nebo akce.

Otevreni modalu trackuje dataLayer udalost `modal_open`, pokud se modal trackuje.

---

## `useDataLayer`

Soubor: `app/composables/useDataLayer.ts`

Wrapper nad `window.dataLayer`.

Tracking se:

- neprovadi na serveru,
- neprovadi na `/cms/*`,
- inicializuje pres `window.dataLayer = window.dataLayer || []`.

Exportovane event funkce:

| Funkce | Event |
|---|---|
| `trackShopClick` | `shop_click` |
| `trackShopView` | `shop_view` |
| `trackEventClick` | `event_click` |
| `trackContactClick` | `contact_click` |
| `trackSearch` | `search` |
| `trackFilterApply` | `filter_applied` |
| `trackMapFloorSelect` | `map_floor_select` |
| `trackMapUnitClick` | `map_unit_click` |
| `trackMapSearch` | `map_search` |
| `trackModalOpen` | `modal_open` |
| `trackGalleryInteraction` | `gallery_interaction` |
| `trackLoadMore` | `load_more` |
| `trackCtaClick` | `cta_click` |
| `trackNavClick` | `nav_click` |
| `trackOutboundClick` | `outbound_click` |
| `trackGridChange` | `grid_change` |
| `trackSliderChange` | `slider_change` |

---

## `useCookieConsent`

Soubor: `app/composables/useCookieConsent.ts`

Wrapper nad Silktide Cookie Managerem.

```ts
const {
  hasConsent,
  hasGivenInitialConsent,
  openCookieSettings,
  revokeAllConsent,
  trackConsentInteraction,
} = useCookieConsent()
```

LocalStorage klice:

| Klic | Popis |
|---|---|
| `silktideCookieChoice_analytick` | souhlas s analytikou |
| `silktideCookieChoice_reklamn_a_personaliza_n` | souhlas s reklamou |
| `silktideCookieBanner_InitialChoice` | zda uzivatel udelal prvni volbu |

`revokeAllConsent()` smaze volby, posle consent update do GTM/gtag a reloadne stranku.

---

## `useSanitizeHtml`

Soubor: `app/composables/useSanitizeHtml.ts`

Sanitizuje HTML z CMS pres DOMPurify.

```ts
const { sanitize } = useSanitizeHtml()
const safeHtml = sanitize(rawHtml)
```

Dulezite omezeni:

- na klientovi DOMPurify bezi,
- na serveru pri SSR composable vraci raw HTML, protoze DOMPurify potrebuje DOM.

---

## `useGlobalLoading`

Soubor: `app/composables/useGlobalLoading.ts`

Globalni loading stav pro requesty a navigaci.

```ts
const {
  isLoading,
  startRequest,
  finishRequest,
  startRoute,
  finishRoute,
} = useGlobalLoading()
```

`plugins/loading-indicator.client.ts` obaluje `globalThis.fetch` a Nuxt hooky `page:start` / `page:finish`.

---

## Server helpery

Nejde o Vue composables, ale dokumentace je zde kvuli castemu pouziti ve stejne vrstve aplikace.

### `server/utils/auth.ts`

| Export | Popis |
|---|---|
| `hashPassword(password)` | bcrypt hash |
| `verifyPassword(password, hash)` | bcrypt compare |
| `generateAccessToken(user, sessionId)` | JWT sign |
| `verifyAccessToken(token)` | JWT verify |
| `generateRefreshToken()` | nahodny token |
| `hashRefreshToken(token)` | SHA-256 hash refresh tokenu |
| `getRefreshTokenExpiry()` | aktualni cas + 7 dni |
| `setAuthCookies(event, access, refresh)` | nastavi auth cookies |
| `clearAuthCookies(event)` | smaze auth cookies |
| `getAccessToken(event)` | cookie nebo Authorization header |
| `getRefreshTokenFromCookie(event)` | refresh token z cookie |
| `getSessionInfo(event)` | user agent a IP |
| `requireAuth(event)` | prihlaseny uzivatel |
| `requireEditor(event)` | editor+ |
| `requireAdmin(event)` | admin+ |
| `requireSuperAdmin(event)` | superadmin |

### `server/utils/csrf.ts`

| Export | Popis |
|---|---|
| `generateCsrfToken()` | nahodny token |
| `setCsrfCookie(event, token?)` | nastavi CSRF cookie |
| `getCsrfTokenFromCookie(event)` | precte CSRF cookie |
| `validateCsrf(event)` | vrati boolean validace |
| `requireCsrf(event)` | pri chybe vyhodi 403 |

### `server/utils/rateLimit.ts`

MongoDB rate limiter s konfiguracemi `login`, `passwordReset` a `api`. Aktualne je pouzity jen pro login.

### `server/utils/slug.ts`

```ts
generateSlug(text: string): string
generateUniqueSlug(text, checkExists, currentId?): Promise<string>
```

Slug generator prevadi ceskou diakritiku na ASCII, normalizuje text a pri kolizi prida ciselny suffix.
