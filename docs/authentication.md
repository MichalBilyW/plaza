# Autentizace a správa session

---

## Přehled

Systém používá **JWT access token + refresh token** uložené v HTTP-only cookies. Každé přihlášení vytvoří záznam v MongoDB kolekci `sessions`, což umožňuje správu více zařízení a revokaci konkrétní session.

---

## 1. Tok přihlášení

```
Uživatel zadá email + heslo (POST /api/auth/login)
        ↓
Rate limiting (5 pokusů / 15 min per IP)
        ↓
Zod validace vstupu (loginSchema)
        ↓
User.findOne({ email, isActive: true }).select('+password')
        ↓
bcrypt.compare(password, user.password)   [SALT_ROUNDS = 12]
        ↓
Vytvoření Session záznamu v MongoDB
  { userId, refreshToken, userAgent, ipAddress, isValid: true, expiresAt: +7d }
        ↓
Aktualizace user.lastLoginAt
        ↓
Generování tokenů:
  • Access token  (JWT, 7 dní) – payload: { id, email, name, role, sessionId }
  • Refresh token (crypto.randomBytes(64).hex, 7 dní)
        ↓
Nastavení HTTP-only cookies:
  • access_token  (maxAge: 7 dní, httpOnly, sameSite: lax)
  • refresh_token (maxAge: 7 dní, httpOnly, sameSite: lax)
        ↓
Nastavení CSRF cookie:
  • csrf_token    (maxAge: 24h, httpOnly: FALSE – čitelný z JS)
        ↓
Response: { user: { _id, email, name, role }, csrfToken }
```

> **Poznámka:** Dokumentace v `Dokmentace_projektu.md` uvádí access token 15 min. Skutečný kód v `server/utils/auth.ts` (`getJwtConfig`) používá **7 dní** pro oba tokeny.

---

## 2. Ověření na každém requestu

Každý chráněný API endpoint volá `requireAuth(event)` nebo `requireEditor(event)` z `server/utils/auth.ts`:

```
HTTP Request s cookie access_token
        ↓
getAccessToken(event)
  1. Přečte cookie access_token
  2. Fallback: Authorization: Bearer <token> header
        ↓
jwt.verify(token, jwtSecret)
        ↓
Dekóduje payload: { id, email, name, role, sessionId }
        ↓
Uloží do event.context.user
        ↓
Pokračuje na handler
```

Pokud token chybí nebo je neplatný → **401 UNAUTHORIZED**.

---

## 3. Obnovení session (refresh)

```
Klient: POST /api/auth/refresh (automaticky po 401)
        ↓
Čtení refresh_token z cookie
        ↓
Session.findOne({ refreshToken, isValid: true, expiresAt: { $gt: now } })
        ↓
        ├── Session NENALEZENA:
        │     Hledá Session podle refreshToken (bez isValid filtru)
        │     Pokud existuje → možný token theft → invaliduje VŠECHNY sessions userId
        │     Smaže cookies → 401
        │
        └── Session NALEZENA:
              User.findOne({ _id: session.userId, isActive: true })
              ↓
              Token rotation:
                nový refreshToken = crypto.randomBytes(64).hex
                session.refreshToken = nový
                session.expiresAt    = now + 7d
                session.lastActivityAt = now
              ↓
              Vygenerování nového access tokenu
              ↓
              Nastavení nových cookies
              ↓
              Nastavení nového CSRF cookie
              ↓
              Response: { user, csrfToken }
```

---

## 4. Multi-device přihlášení

Každé přihlášení = nová Session v MongoDB. Uživatel může být přihlášen na libovolném počtu zařízení současně.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Zařízení 1 │     │  Zařízení 2 │     │  Zařízení 3 │
│  (Laptop)   │     │  (Telefon)  │     │  (Tablet)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │ refresh_token_A   │ refresh_token_B   │ refresh_token_C
       └───────────────────┼───────────────────┘
                           ▼
                 ┌─────────────────┐
                 │    MongoDB      │
                 │  Session A      │  ← userId: admin, isValid: true
                 │  Session B      │  ← userId: admin, isValid: true
                 │  Session C      │  ← userId: admin, isValid: true
                 └─────────────────┘
```

---

## 5. Správa sessions (API)

| Endpoint | Popis |
|---|---|
| `GET /api/auth/sessions` | Seznam aktivních sessions přihlášeného uživatele |
| `DELETE /api/auth/sessions` | Odhlášení ze všech ostatních sessions |
| `DELETE /api/auth/sessions/:id` | Odhlášení konkrétní session |

Response `GET /api/auth/sessions`:
```json
{
  "sessions": [
    {
      "id": "...",
      "userAgent": "Mozilla/5.0 ...",
      "ipAddress": "192.168.1.1",
      "lastActivityAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "isCurrent": true
    }
  ],
  "currentSessionId": "..."
}
```

---

## 6. Odhlášení

```
POST /api/auth/logout
        ↓
requireAuth(event)  [musí být přihlášen]
        ↓
Session.findOneAndUpdate(
  { userId, refreshToken, isValid: true },
  { isValid: false }
)
        ↓
clearAuthCookies(event)  [smaže access_token + refresh_token]
        ↓
Response: { success: true }
```

---

## 7. Změna hesla

`POST /api/auth/change-password`

- Vyžaduje CSRF token (`X-CSRF-Token` header)
- Ověří aktuální heslo pomocí bcrypt
- Hashuje nové heslo (SALT_ROUNDS = 12)
- Neodhlašuje ostatní sessions (nutné ověřit, zda je toto záměr)

---

## 8. Cookies

| Cookie | httpOnly | sameSite | maxAge | Popis |
|---|---|---|---|---|
| `access_token` | `true` | `lax` | 7 dní | JWT access token |
| `refresh_token` | `true` | `lax` | 7 dní | Náhodný hex token |
| `csrf_token` | `false` | `lax` | 24 hod | CSRF ochrana – čitelný z JS |

`secure` flag je řízen proměnnou `NUXT_COOKIE_SECURE`:
- `NUXT_COOKIE_SECURE=false` → cookies bez `secure` (pro HTTP vývoj)
- jinak: `secure: process.env.NODE_ENV === 'production'`

---

## 9. Role a oprávnění

| Role | Oprávnění |
|---|---|
| `superadmin` | Plný přístup včetně `staticAroundMap` v GeneralInfo |
| `admin` | Správa obchodů, akcí, služeb, novinek, kategorií, pater, správců |
| `editor` | Správa obchodů, akcí, služeb, novinek, kategorií, pater (bez správců) |

Server-side helper funkce v `server/utils/auth.ts`:

```typescript
requireAuth(event)        // Vyžaduje jakékoli přihlášení
requireEditor(event)      // Vyžaduje roli editor, admin nebo superadmin
requireAdmin(event)       // Vyžaduje roli admin nebo superadmin
requireSuperAdmin(event)  // Vyžaduje roli superadmin
```

CMS middleware `app/middleware/cms.ts`:
- Volá `GET /api/auth/me` při každé navigaci v CMS
- Přesměrovává na `/cms/login` při 401
- Vrací 403 pro `/cms/spravci` pokud role není `admin` nebo `superadmin`

---

## 10. Frontend – composable useCmsAuth

`app/composables/useCmsAuth.ts` poskytuje:

```typescript
const { user, isLoading, csrfToken, login, logout, fetchUser, secureFetch } = useCmsAuth()
```

- `user` – reaktivní stav přihlášeného uživatele (`useState('cms-user')`)
- `csrfToken` – CSRF token načtený z cookie po přihlášení
- `secureFetch` – wrapper kolem `$fetch` přidávající `X-CSRF-Token` header
  - Při 403 odpovědi automaticky zavolá `fetchUser()` a zopakuje request
- `login(email, password)` – přihlásí uživatele a uloží token do state
- `logout()` – odhlásí a přesměruje na `/cms/login`

---

## TTL index na Session modelu

```typescript
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

MongoDB automaticky smaže expirované session dokumenty. Není potřeba manuální cleanup.
