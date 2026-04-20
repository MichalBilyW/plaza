# API Endpointy

Všechny endpointy jsou pod prefixem `/api/`. Formát chyb je konzistentní – viz sekci [Formát chyb](#formát-chyb).

---

## Autentizace a session

### `POST /api/auth/login`
Přihlášení do CMS.

- **Auth:** Ne
- **Rate limit:** 5 pokusů / 15 min per IP, blokace 15 min
- **CSRF:** Ne (login endpoint CSRF nechrání)
- **Request body:**
  ```json
  { "email": "admin@ocplaza.cz", "password": "heslo123" }
  ```
- **Response `200`:**
  ```json
  { "user": { "_id": "...", "email": "...", "name": "...", "role": "admin" }, "csrfToken": "..." }
  ```
- **Vedlejší efekty:** Nastaví cookies `access_token`, `refresh_token`, `csrf_token`. Vytvoří Session v DB. Aktualizuje `user.lastLoginAt`.

---

### `POST /api/auth/logout`
Odhlášení – zneplatnění aktuální session.

- **Auth:** Ano
- **CSRF:** Ne
- **Response `200`:** `{ "success": true }`
- **Vedlejší efekty:** Smaže cookies, nastaví `session.isValid = false`.

---

### `GET /api/auth/me`
Profil přihlášeného uživatele.

- **Auth:** Ano
- **Response `200`:**
  ```json
  { "_id": "...", "email": "...", "name": "...", "role": "admin", "isActive": true }
  ```
- **Poznámka:** Pokud se role v DB liší od role v JWT, automaticky obnoví access token.

---

### `POST /api/auth/refresh`
Obnovení access tokenu (token rotation).

- **Auth:** Ne (čte refresh_token z cookie)
- **Response `200`:** `{ "user": {...}, "csrfToken": "..." }`
- **Vedlejší efekty:** Vygeneruje nový refresh token, aktualizuje Session v DB, nastaví nové cookies.
- **Bezpečnost:** Detekuje token theft – při opakovaném použití starého refresh tokenu invaliduje VŠECHNY sessions uživatele.

---

### `POST /api/auth/change-password`
Změna hesla přihlášeného uživatele.

- **Auth:** Ano
- **CSRF:** Ano (`X-CSRF-Token` header)
- **Request body:**
  ```json
  { "currentPassword": "...", "newPassword": "...", "confirmPassword": "..." }
  ```
- **Validace:** `newPassword` min. 8 znaků, shoda s `confirmPassword`
- **Response `200`:** `{ "success": true, "message": "Heslo bylo úspěšně změněno" }`

---

### `GET /api/auth/sessions`
Seznam aktivních sessions přihlášeného uživatele.

- **Auth:** Ano
- **Response `200`:**
  ```json
  {
    "sessions": [
      { "id": "...", "userAgent": "...", "ipAddress": "...", "lastActivityAt": "...", "createdAt": "...", "isCurrent": true }
    ],
    "currentSessionId": "..."
  }
  ```

---

### `DELETE /api/auth/sessions`
Odhlášení ze všech ostatních sessions.

- **Auth:** Ano
- **CSRF:** Ne
- **Response `200`:** `{ "success": true, "revokedCount": 2 }`

---

### `DELETE /api/auth/sessions/:id`
Odhlášení konkrétní session.

- **Auth:** Ano
- **Response `200`:** `{ "success": true }`

---

## Obchody (`/api/shops`)

### `GET /api/shops`
Seznam obchodů s filtrováním a stránkováním.

- **Auth:** Ne (veřejný endpoint)
- **Query parametry:**

| Parametr | Typ | Popis |
|---|---|---|
| `page` | number | Stránka (default: 1) |
| `limit` | number | Počet záznamů, max 100 (default: 20) |
| `sort` | string | Pole pro řazení (default: `name`) |
| `order` | `asc` / `desc` | Směr řazení (default: `asc`) |
| `floorId` | ObjectId | Filtr podle patra |
| `categoryId` | ObjectId | Filtr podle kategorie |
| `search` | string | Fulltextové vyhledávání v názvu (regex) |
| `isActive` | boolean | Filtr podle stavu (pokud neuvedeno, vrátí vše) |

- **Response `200`:**
  ```json
  {
    "data": [{ "_id": "...", "name": "...", "slug": "...", "floors": [...], "categories": [...], ... }],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
  ```
- **Populace:** `floorId` → `name, level`, `floorIds` → `name, level`, `categoryIds` → `name, slug, icon, color`

---

### `GET /api/shops/:id`
Detail obchodu.

- **Auth:** Ne
- **Response `200`:** Objekt obchodu s populovanými `floorId`, `floorIds`, `categoryIds`

---

### `POST /api/shops`
Vytvoření nového obchodu.

- **Auth:** Ano – role `editor` nebo vyšší
- **CSRF:** Interně nevolá `requireCsrf` – CSRF ochrana je zajištěna přes cookie-based auth
- **Request body:** Dle `shopCreateSchema` (viz `shared/schemas/index.ts`)
- **Slug:** Automaticky generován z `name` pokud není zadán
- **Response `200`:** Vytvořený obchod s populovanými poli

---

### `PUT /api/shops/:id`
Úprava obchodu.

- **Auth:** Ano – role `editor` nebo vyšší
- **Request body:** Dle `shopUpdateSchema` (parciální `shopCreateSchema`)
- **Response `200`:** Aktualizovaný obchod

---

### `DELETE /api/shops/:id`
Smazání obchodu.

- **Auth:** Ano – role `admin` nebo vyšší
- **Response `200`:** `{ "success": true, "message": "Obchod byl smazán" }`

---

## Akce (`/api/events`)

### `GET /api/events`
Seznam akcí.

- **Auth:** Ne
- **Query parametry:** `page`, `limit`, `sort` (default: `sortOrder`), `order`, `isActive`, `shopId`, `search`
- **Populace:** `shopId` → `name, logo, slug`
- **Response:** `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`

---

### `GET /api/events/:id`
Detail akce.

- **Auth:** Ne

---

### `POST /api/events`
Vytvoření akce.

- **Auth:** Ano – role `editor` nebo vyšší
- **Request body:** `{ "name", "image", "shopId", "content"?, "isActive"?, "sortOrder"? }`

---

### `PUT /api/events/:id`
Úprava akce.

- **Auth:** Ano – role `editor` nebo vyšší

---

### `DELETE /api/events/:id`
Smazání akce.

- **Auth:** Ano – role `editor` nebo vyšší

---

### `PUT /api/events/reorder`
Hromadná změna pořadí akcí (drag & drop).

- **Auth:** Ano – role `editor` nebo vyšší
- **Request body:** `{ "ids": ["id1", "id2", "id3"] }` – pořadí v poli = nový `sortOrder`
- **Implementace:** MongoDB `bulkWrite` s `updateOne` per záznam

---

## Novinky (`/api/news`)

Stejná struktura jako `/api/events` s výjimkou:

- Novinky nemají vazbu na obchod (`shopId`)
- Mají pole `sortOrder` pro řazení
- Reorder endpoint: `PUT /api/news/reorder`

### Endpointy:
- `GET /api/news` – veřejný, filtr: `isActive`, `search`
- `GET /api/news/:id` – veřejný
- `POST /api/news` – `editor+`
- `PUT /api/news/:id` – `editor+`
- `DELETE /api/news/:id` – `editor+`
- `PUT /api/news/reorder` – `editor+`

---

## Služby (`/api/services`)

Stejná struktura jako `/api/news`.

### Endpointy:
- `GET /api/services` – veřejný
- `GET /api/services/:id` – veřejný
- `POST /api/services` – `editor+`
- `PUT /api/services/:id` – `editor+`
- `DELETE /api/services/:id` – `editor+`
- `PUT /api/services/reorder` – `editor+`

---

## Kategorie (`/api/categories`)

### Endpointy:
- `GET /api/categories` – veřejný, query: `page`, `limit`, `sort`, `order`, `search`, `isActive`
- `GET /api/categories/:id` – veřejný
- `POST /api/categories` – `editor+`, auto-generuje slug
- `PUT /api/categories/:id` – `editor+`
- `DELETE /api/categories/:id` – `editor+`
- `PUT /api/categories/reorder` – `editor+`

---

## Patra (`/api/floors`)

### Endpointy:
- `GET /api/floors` – veřejný
- `GET /api/floors/:id` – veřejný
- `POST /api/floors` – `editor+`
- `PUT /api/floors/:id` – `editor+`
- `DELETE /api/floors/:id` – `editor+`
- `PUT /api/floors/reorder` – `editor+`

---

## Obecné informace (`/api/general-info`)

Singleton – vždy jeden záznam v DB (`GeneralInfo.getOrCreate()`).

### `GET /api/general-info`
- **Auth:** Ne
- **Response:** Celý objekt GeneralInfo

### `PUT /api/general-info`
- **Auth:**
  - `editor+` pro běžné úpravy
  - `superadmin` pokud body obsahuje `staticAroundMap`
- **Request body:** Dle `generalInfoUpdateSchema`
- **Vedlejší efekty:** Upsert – vytvoří záznam pokud neexistuje

---

## Hlavní stránka (`/api/homepage`)

Singleton.

### `GET /api/homepage`
- **Auth:** Ne

### `PUT /api/homepage`
- **Auth:** `editor+`
- **Request body:** `{ "heroImage"?: string, "showHeroBorder"?: boolean }`

---

## Mapa (`/api/map`)

### `GET /api/map/units`
Vrací jednotky všech pater s informací o obsazenosti a dnešních otevíracích hodinách.

- **Auth:** Ne
- **Query:** `floorId` (volitelný filtr)
- **Zdroj dat:** SVG soubory uložené u pater (`Floor.svgMap`) – jednotky jsou extrahovány dynamicky ze SVG
- **Response:**
  ```json
  {
    "floors": [
      {
        "floorId": "...",
        "name": "Přízemí",
        "level": 0,
        "units": [
          {
            "unitCode": "A01",
            "isOccupied": true,
            "shop": { "name": "H&M", "slug": "hm", "logo": "..." },
            "todayOpeningHours": { "open": "09:00", "close": "21:00", "isOpen": true }
          }
        ]
      }
    ],
    "totalUnits": 120,
    "occupiedUnits": 95,
    "staticAroundMap": "/api/uploads/uuid.svg",
    "staticAroundMapContent": "<svg>...</svg>"
  }
  ```

---

## Správci (`/api/users`)

### `GET /api/users`
- **Auth:** Ano – role `admin` nebo vyšší
- **Query:** `page`, `limit`, `sort` (default: `createdAt`), `order`
- **Response:** `{ "data": [...], "pagination": {...} }` – heslo nikdy nevráceno

### `POST /api/users`
- **Auth:** Ano – role `admin` nebo vyšší
- **Request body:** `{ "email", "name", "password", "role"?, "isActive"? }`
- **Validace:** `name` 2–100 znaků, `password` min. 8 znaků, unikátní email
- **Vedlejší efekty:** Heslo hashováno bcrypt (SALT_ROUNDS=12)

### `GET /api/users/:id`
- **Auth:** Ano – role `admin` nebo vyšší

### `PUT /api/users/:id`
- **Auth:** Ano – role `admin` nebo vyšší
- **Poznámka:** Pokud je zadáno `password`, bude přehashováno

### `DELETE /api/users/:id`
- **Auth:** Ano – role `admin` nebo vyšší
- **Ochrana:** Nelze smazat sám sebe
- **Vedlejší efekty:** Invaliduje všechny sessions smazaného uživatele

---

## Upload souborů (`/api/upload`)

### `POST /api/upload`
Nahrání obrázku.

- **Auth:** Ano – role `editor` nebo vyšší
- **Content-Type:** `multipart/form-data`
- **Field:** `file`
- **Povolené typy:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- **Max velikost:** 3 MB
- **Ukládání:**
  - Development: `public/uploads/<uuid>.<ext>`
  - Production: `.output/public/uploads/<uuid>.<ext>`
- **Response `200`:**
  ```json
  { "url": "/api/uploads/<uuid>.jpg", "filename": "<uuid>.jpg", "size": 102400 }
  ```

---

## Servírování souborů (`/api/uploads`)

### `GET /api/uploads/:filename`
Servírování nahraných souborů.

- **Auth:** Ne (veřejný přístup)
- **Bezpečnostní kontroly:**
  1. Path traversal ochrana (`..`, `/`, `\` v názvu → 400)
  2. Whitelist přípon (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`)
  3. UUID formát souboru (regex validace)
- **Cache:** `Cache-Control: public, max-age=31536000, immutable` (UUID = immutable)
- **Podporuje:** Range requests, ETag, Last-Modified (přes Nitro `serveStatic`)

---

## Sitemap (`/api/__sitemap__`)

### `GET /api/__sitemap__/urls`
Dynamické URL pro sitemap generátor (`@nuxtjs/sitemap`).

- **Auth:** Ne
- **Vrací:** URL pro všechny aktivní obchody (`/obchody/:slug`)
- **Poznámka:** Akce a novinky nemají vlastní stránky (zobrazují se v modálech), proto nejsou v sitemapě.

---

## Health check

### `GET /api/health`
Kontrola stavu aplikace.

- **Auth:** Ne
- **Použití:** Docker HEALTHCHECK, monitoring

---

## Formát chyb

Všechny chyby jsou ve formátu:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Popis chyby",
  "statusCode": 400,
  "fields": {
    "email": "Neplatný email",
    "password": "Heslo je příliš krátké"
  }
}
```

Kódy chyb (`ErrorCodes` v `server/utils/errors.ts`):

| Kód | HTTP Status | Popis |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Neplatný vstup |
| `UNAUTHORIZED` | 401 | Nepřihlášen |
| `FORBIDDEN` | 403 | Nedostatečná oprávnění |
| `INVALID_CREDENTIALS` | 401 | Neplatné přihlašovací údaje |
| `TOKEN_EXPIRED` | 401 | Token expiroval |
| `NOT_FOUND` | 404 | Záznam nenalezen |
| `ALREADY_EXISTS` | 409 | Záznam již existuje |
| `RATE_LIMIT_EXCEEDED` | 429 | Příliš mnoho requestů |
| `INTERNAL_ERROR` | 500 | Serverová chyba |
| `DATABASE_ERROR` | 500 | Chyba databáze |
