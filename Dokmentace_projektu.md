# Autentizační systém

### 1. Přihlášení (`POST /api/auth/login`)

```
Uživatel zadá email + heslo
        ↓
Rate limiting (max 5 pokusů / 15 min)
        ↓
Ověření hesla (bcrypt)
        ↓
Vytvoření Session záznamu v DB
        ↓
Generování tokenů:
  • Access token (JWT, 15 min) - obsahuje userId, email, name, role, sessionId
  • Refresh token (random 128 znaků, 7 dní)
        ↓
Nastavení HTTP-only cookies:
  • access_token (15 min)
  • refresh_token (7 dní)
  • csrf_token
```

### 2. Držení session

**Každý API request:**

1. Middleware čte `access_token` z cookie
2. Ověří JWT podpis a expiraci
3. Dekóduje user info (role, id, sessionId)

**Po expiraci access tokenu (15 min):**

```
Klient volá POST /api/auth/refresh
        ↓
Server najde Session podle refresh_token
        ↓
Token rotation - vygeneruje NOVÝ refresh token
        ↓
Vrátí nový access_token + nový refresh_token
```

### 3. Multi-device přihlášení

**Každé zařízení = samostatná Session v DB:**

```jsx
// Session model ukládá:
{
  userId: ObjectId,
  refreshToken: "unique-per-device",
  userAgent: "Chrome/120...",
  ipAddress: "192.168.1.1",
  isValid: true,
  expiresAt: Date,
  lastActivityAt: Date
}
```

**Co se děje při přihlášení z nového zařízení:**

- Vytvoří se **nová** Session (stará zůstává aktivní)
- Uživatel může být přihlášen na více zařízeních současně
- Každé zařízení má vlastní refresh token

**Správa sessions (`/api/auth/sessions`):**

- `GET` - seznam všech aktivních sessions uživatele
- `DELETE /:id` - odhlásit konkrétní session (např. ztracený telefon)
- `DELETE` - odhlásit všechny ostatní sessions

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Zařízení 1 │     │  Zařízení 2 │     │  Zařízení 3 │
│  (Laptop)   │     │  (Telefon)  │     │  (Tablet)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ refresh_token_A   │ refresh_token_B   │ refresh_token_C
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │    MongoDB      │
                 │  ┌───────────┐  │
                 │  │ Session A │  │  ← userId: admin
                 │  │ Session B │  │  ← userId: admin
                 │  │ Session C │  │  ← userId: admin
                 │  └───────────┘  │
                 └─────────────────┘
```

Jeden uživatel (`admin@ocplaza.cz`) může mít tedy 3 aktivní sessions = 3 různé refresh tokeny, ale všechny sdílejí stejné `userId`.

---

# Správa uživatelů (Správci)

Systém správy CMS uživatelů s podporou rolí a oprávnění.

## User Model

```typescript
interface IUser {
  email: string          // Unikátní, lowercase, trimmed
  password: string       // Hashované (bcrypt), select: false
  name: string
  role: 'admin' | 'editor'
  isActive: boolean      // Deaktivovaný uživatel se nemůže přihlásit
  lastLoginAt?: Date     // Nastaveno při každém přihlášení
}
```

## Role a oprávnění

| Role | Oprávnění |
|------|-----------|
| **admin** | Plný přístup - správa obchodů, akcí, služeb a dalších správců |
| **editor** | Správa obchodů, akcí, služeb (bez přístupu ke správcům) |

```
┌─────────────────────────────────────────────────────────┐
│                      CMS Sidebar                        │
├─────────────────────────────────────────────────────────┤
│  Dashboard                    ✓ admin  ✓ editor         │
│  Obchody                      ✓ admin  ✓ editor         │
│  Akce                         ✓ admin  ✓ editor         │
│  Služby                       ✓ admin  ✓ editor         │
│  Správci                      ✓ admin  ✗ editor         │
└─────────────────────────────────────────────────────────┘
```

## API Endpointy

### `GET /api/users` - Seznam správců
- **Pouze admin**
- Podporuje paginaci (`page`, `limit`) a řazení (`sort`, `order`)
- Vrací seznam uživatelů bez hesla

### `POST /api/users` - Vytvoření správce
- **Pouze admin** + CSRF ochrana
- Validace: email, name (2-100 znaků), password (min 8 znaků), role
- Kontrola duplicitního emailu
- Automatické hashování hesla

```typescript
// Request body
{
  email: string,      // povinný
  name: string,       // povinný
  password: string,   // povinný, min 8 znaků
  role: 'admin' | 'editor',  // default: 'editor'
  isActive: boolean   // default: true
}
```

### `GET /api/users/:id` - Detail správce
- **Pouze admin**
- Validace ObjectId

### `PUT /api/users/:id` - Úprava správce
- **Pouze admin** + CSRF ochrana
- Všechna pole jsou volitelná
- Pokud je zadáno heslo, je zahashováno
- Kontrola duplicitního emailu (pokud se mění)

```typescript
// Request body (všechna pole volitelná)
{
  email?: string,
  name?: string,
  password?: string,  // pokud zadáno, bude změněno
  role?: 'admin' | 'editor',
  isActive?: boolean
}
```

### `DELETE /api/users/:id` - Smazání správce
- **Pouze admin** + CSRF ochrana
- **Nelze smazat sám sebe**
- Při smazání automaticky zneplatní všechny sessions uživatele

## Frontend stránky

```
/cms/spravci/
├── index.vue      - Seznam správců (tabulka desktop, karty mobile)
├── novy.vue       - Formulář pro vytvoření nového správce
└── [id].vue       - Formulář pro úpravu existujícího správce
```

### Přístupová kontrola

Middleware `cms.ts` kontroluje:
1. Přihlášení uživatele (přístup k `/api/auth/me`)
2. Pro `/cms/spravci/*` stránky vyžaduje roli `admin`

```typescript
// Kontrola oprávnění v middleware
if (to.path.startsWith('/cms/spravci') && userData.role !== 'admin') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'Nemáte oprávnění k zobrazení této stránky'
  })
}
```

### Composable `useCmsAuth`

```typescript
const { user, isAdmin, secureFetch, logout } = useCmsAuth()

// user - aktuální přihlášený uživatel
// isAdmin - computed: user.role === 'admin'
// secureFetch - fetch s automatickým CSRF tokenem
// logout - odhlášení a přesměrování na login
```

## Bezpečnostní opatření

| Ochrana | Implementace |
|---------|--------------|
| **Heslo** | bcrypt hash, nikdy se nevrací v API (select: false) |
| **CSRF** | Všechny mutace vyžadují X-CSRF-Token header |
| **Role** | requireAdmin() helper kontroluje token a roli |
| **Self-delete** | Nelze smazat vlastní účet |
| **Session cleanup** | Při smazání uživatele se zneplatní všechny jeho sessions |

---

### 4. Bezpečnostní mechanismy

| Mechanismus | Účel |
| --- | --- |
| **Token rotation** | Každý refresh generuje nový refresh token - starý je neplatný |
| **Token theft detection** | Pokud někdo použije starý refresh token → zneplatní SE VŠECHNY sessions uživatele |
| **CSRF token** | Ochrana proti CSRF útokům na state-changing operace |
| **HTTP-only cookies** | JavaScript nemá přístup k tokenům |
| **Rate limiting** | Ochrana proti brute-force |
