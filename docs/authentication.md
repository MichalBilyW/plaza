# Autentizace a session

Systém používá JWT access token a náhodný refresh token uložené v HTTP-only cookies. Každé přihlášení vytvoří záznam v MongoDB kolekci `sessions`.

---

## Hlavní soubory

| Soubor | Účel |
|---|---|
| `server/utils/auth.ts` | JWT, cookies, role helpery, hash hesel |
| `server/utils/csrf.ts` | CSRF double-submit cookie |
| `server/utils/rateLimit.ts` | MongoDB rate limiter |
| `server/models/User.ts` | CMS uživatelé |
| `server/models/Session.ts` | Session záznamy |
| `server/models/RateLimit.ts` | Rate limit záznamy |
| `app/composables/useCmsAuth.ts` | Frontend auth state a `secureFetch` |
| `app/middleware/cms.ts` | Ochrana CMS rout |

---

## Tokeny a cookies

| Cookie | httpOnly | sameSite | maxAge | Účel |
|---|---:|---|---:|---|
| `access_token` | ano | `lax` | 7 dní | JWT access token |
| `refresh_token` | ano | `lax` | 7 dní | náhodný refresh token |
| `csrf_token` | ne | `lax` | 24 hodin | CSRF double-submit token |

`secure` flag:

- pokud `NUXT_COOKIE_SECURE=false`, nastaví se `secure: false`,
- jinak je `secure` zapnutý v produkci podle `NODE_ENV === 'production'`.

Poznámka: `clearAuthCookies()` maže `access_token` a `refresh_token`; CSRF cookie se samostatně nemaže.

---

## Expirace

V `server/utils/auth.ts` je expirace tokenů aktuálně hardcoded:

```ts
accessTokenExpiresIn: '7d'
refreshTokenExpiresIn: '7d'
refreshTokenExpiresMs: 7 * 24 * 60 * 60 * 1000
```

`NUXT_JWT_EXPIRES_IN` je v `nuxt.config.ts` načtené do runtime configu, ale `getJwtConfig()` ho aktuálně nepoužívá. Reálná expirace access tokenu je tedy 7 dní.

---

## Přihlášení

Endpoint: `POST /api/auth/login`

Tok:

1. Vypočítá rate limit key `login:<ip>`.
2. Zkontroluje MongoDB rate limit: 5 pokusů / 15 minut, blokace 30 minut.
3. Validuje body přes `loginSchema`.
4. Najde aktivního uživatele podle e-mailu a explicitně načte `password`.
5. Ověří heslo přes bcrypt.
6. Po úspěchu resetuje rate limit pro IP.
7. Vytvoří `Session` s refresh tokenem, user agentem, IP a expirací.
8. Aktualizuje `lastLoginAt`.
9. Vygeneruje JWT access token s `sessionId`.
10. Nastaví `access_token`, `refresh_token`, `csrf_token`.
11. Vrátí user objekt a CSRF token.

JWT payload:

```ts
{
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'editor'
  sessionId: string
}
```

---

## Ověření chráněných endpointů

Chráněné endpointy používají helpery:

- `requireAuth(event)`
- `requireEditor(event)`
- `requireAdmin(event)`
- `requireSuperAdmin(event)`

`getAccessToken(event)` čte:

1. cookie `access_token`,
2. fallback `Authorization: Bearer <token>`.

Pokud token chybí nebo nejde ověřit, request končí 401.

---

## CMS middleware

`app/middleware/cms.ts` běží pro CMS stránky.

Chování:

- `/cms/login` pustí bez kontroly,
- ostatní CMS stránky volají `GET /api/auth/me`,
- 401 vede na `/cms/login`,
- `/cms/spravci/**` vyžaduje `admin` nebo `superadmin`,
- po úspěchu se user uloží do `useState('cms-user')`.

---

## Refresh

Endpoint: `POST /api/auth/refresh`

Tok:

1. Přečte `refresh_token` cookie.
2. Najde validní a neexpirovanou session.
3. Pokud session nenajde, pokusí se najít session podle refresh tokenu bez `isValid` filtru.
4. Pokud existuje stará/kompromitovaná session, invaliduje všechny sessions daného uživatele.
5. Pokud je session validní, vygeneruje nový refresh token.
6. Aktualizuje session: `refreshToken`, `expiresAt`, `lastActivityAt`, user agent a IP.
7. Vygeneruje nový access token.
8. Nastaví nové auth cookies a nový CSRF token.

Tím se implementuje refresh token rotation a základní token theft detection.

---

## Odhlášení

Endpoint: `POST /api/auth/logout`

Vyžaduje auth. Najde aktuální session podle `userId`, `refreshToken` a `isValid=true`, nastaví `isValid=false` a smaže auth cookies.

Odhlášení se týká pouze aktuálního zařízení/session.

---

## Správa sessions

Endpointy:

| Endpoint | Popis |
|---|---|
| `GET /api/auth/sessions` | aktivní sessions aktuálního uživatele |
| `DELETE /api/auth/sessions` | zneplatní všechny ostatní sessions |
| `DELETE /api/auth/sessions/:id` | zneplatní konkrétní session |

Tyto endpointy existují a jsou dostupné v composable `useCmsAuth`, ale v aktuálním CMS UI není samostatná obrazovka pro přehled aktivních zařízení.

---

## Změna hesla

Endpoint: `POST /api/auth/change-password`

- Auth: ano
- CSRF: ano
- Vyžaduje aktuální heslo.
- Nové heslo musí mít alespoň 8 znaků.
- `newPassword` a `confirmPassword` se musí shodovat.
- Nové heslo se ukládá jako bcrypt hash.

Důležité: aktuální implementace po změně hesla neinvaliduje ostatní sessions. Pokud je cílem bezpečnostní reset účtu, je potřeba doplnit invalidaci sessions nebo uživatele deaktivovat a znovu aktivovat po kontrole.

---

## Role a oprávnění

| Role | Server helper |
|---|---|
| `editor` | projde přes `requireEditor` |
| `admin` | projde přes `requireEditor` a `requireAdmin` |
| `superadmin` | projde přes všechny helpery včetně `requireSuperAdmin` |

Pravidla správy uživatelů:

- admin může spravovat editory a adminy,
- admin nemůže vytvářet/upravovat/mazat superadminy,
- superadmin může spravovat všechny role,
- uživatel nemůže smazat vlastní účet.

---

## Hesla

Hesla se hashují přes `bcryptjs`.

```ts
const SALT_ROUNDS = 12
```

Model `User` má `password` nastavené jako `select: false`, takže se heslo nevrací v běžných dotazech.

---

## CSRF

Soubor: `server/utils/csrf.ts`

Použitý pattern: double-submit cookie.

Tok:

1. Server nastaví `csrf_token` cookie.
2. Frontend přečte cookie a přidá `X-CSRF-Token`.
3. Server porovná cookie a header přes `crypto.timingSafeEqual`.

Explicitní CSRF ochrana je aktuálně na:

- `POST /api/auth/change-password`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Ostatní write endpointy CSRF přímo nevyžadují.

---

## Frontend composable `useCmsAuth`

Soubor: `app/composables/useCmsAuth.ts`

Exportuje:

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

`secureFetch`:

- přidává `X-CSRF-Token`, pokud token existuje,
- používá `credentials: 'include'`,
- při 403 zavolá `fetchUser()` a request jednou zopakuje.

Poznámka: název `refreshToken` ve frontend composable znamená volání `/api/auth/refresh`, nikoli hodnotu refresh tokenu.

---

## TTL cleanup

`Session` má TTL index na `expiresAt`.

`RateLimit` má TTL index na `expiresAt`.

MongoDB TTL monitor běží periodicky, typicky přibližně jednou za 60 sekund. Mazání proto není okamžité na milisekundu přesně.
