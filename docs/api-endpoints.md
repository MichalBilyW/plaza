# API endpointy

API běží pod prefixem `/api/`. Implementace je ve složce `server/api/`, registry endpointů je v `shared/api/endpoints.ts`.

Nuxt route rule má pro `/api/**` zapnuté `cors: true`.

---

## Konvence

| Oblast | Konvence |
|---|---|
| Chyby | jednotný JSON formát přes `server/utils/errors.ts` |
| Validace | Zod schémata ve `shared/schemas/index.ts` |
| Auth | JWT access token v cookie `access_token` nebo `Authorization: Bearer` fallback |
| Refresh | `refresh_token` HTTP-only cookie |
| CSRF | explicitně pouze na vybraných write endpointech |
| Role | `editor`, `admin`, `superadmin` |

---

## Formát chyb

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Popis chyby",
  "statusCode": 400,
  "fields": {
    "email": "Neplatný email"
  }
}
```

Kódy:

| Kód | HTTP | Význam |
|---|---:|---|
| `VALIDATION_ERROR` | 400 | Neplatný vstup |
| `INVALID_INPUT` | 400 | Neplatný vstup |
| `UNAUTHORIZED` | 401 | Nepřihlášen |
| `FORBIDDEN` | 403 | Nedostatečná oprávnění |
| `INVALID_CREDENTIALS` | 401 | Neplatné přihlašovací údaje |
| `TOKEN_EXPIRED` | 401 | Token expiroval |
| `TOKEN_INVALID` | 401 | Token je neplatný |
| `NOT_FOUND` | 404 | Záznam nenalezen |
| `ALREADY_EXISTS` | 409 | Záznam existuje |
| `CONFLICT` | 409 | Konflikt |
| `RATE_LIMITED` | 429 | Rate limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Překročen rate limit |
| `INTERNAL_ERROR` | 500 | Interní chyba |
| `DATABASE_ERROR` | 500 | Chyba databáze |

---

## CSRF přehled

Server explicitně volá `requireCsrf` na:

- `POST /api/auth/change-password`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Ostatní write endpointy CSRF přímo nevyžadují a spoléhají na HTTP-only cookies, role check a `sameSite: lax`.

---

## Auth endpointy

### `POST /api/auth/login`

Přihlášení do CMS.

- Auth: ne
- CSRF: ne
- Rate limit: 5 pokusů / 15 minut / IP, blokace 30 minut
- Body:

```json
{ "email": "admin@ocplaza.cz", "password": "heslo" }
```

Vedlejší efekty:

- vytvoří `Session`,
- nastaví `access_token`,
- nastaví `refresh_token`,
- nastaví `csrf_token`,
- uloží `lastLoginAt`,
- po úspěchu resetuje login rate limit.

Response:

```json
{
  "user": {
    "_id": "...",
    "email": "...",
    "name": "...",
    "role": "admin",
    "isActive": true
  },
  "csrfToken": "..."
}
```

### `POST /api/auth/logout`

Odhlášení aktuální session.

- Auth: ano
- CSRF: ne
- Vedlejší efekty: invaliduje aktuální session podle refresh tokenu a smaže auth cookies

### `GET /api/auth/me`

Profil přihlášeného uživatele.

- Auth: ano
- Pokud se role v DB liší od role v JWT a existuje refresh token, nastaví nový access token.

Response:

```json
{
  "_id": "...",
  "email": "...",
  "name": "...",
  "role": "admin",
  "isActive": true
}
```

### `POST /api/auth/refresh`

Rotace refresh tokenu a obnovení access tokenu.

- Auth: ne, čte `refresh_token` cookie
- CSRF: ne
- Při detekci použitého/starého refresh tokenu invaliduje všechny sessions daného uživatele.

### `POST /api/auth/change-password`

Změna hesla přihlášeného uživatele.

- Auth: ano
- CSRF: ano
- Body:

```json
{
  "currentPassword": "...",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

Poznámka: aktuální implementace neinvaliduje ostatní sessions po změně hesla.

### `GET /api/auth/sessions`

Seznam aktivních sessions aktuálního uživatele.

- Auth: ano
- CSRF: ne

### `DELETE /api/auth/sessions`

Odhlášení všech ostatních sessions uživatele.

- Auth: ano
- CSRF: ne

### `DELETE /api/auth/sessions/:id`

Odhlášení konkrétní session.

- Auth: ano
- CSRF: ne
- Pokud se ruší aktuální session, smaže auth cookies.

---

## Obchody `/api/shops`

### `GET /api/shops`

Seznam obchodů.

- Auth: ne
- Query:

| Parametr | Typ | Poznámka |
|---|---|---|
| `page` | number | default 1 |
| `limit` | number | default 20, max 100 |
| `sort` | string | default `name` |
| `order` | `asc`/`desc` | default `asc` |
| `floorId` | ObjectId | filtruje legacy `floorId` |
| `categoryId` | ObjectId | filtr přes `categoryIds` |
| `categorySlug` | string | nejprve dohledá aktivní kategorii |
| `search` | string | regex nad `name` |
| `isActive` | boolean | pokud chybí, vrací vše |

Response používá `pagination`.

### `GET /api/shops/:id`

Detail obchodu podle MongoDB ID nebo slugu.

- Auth: ne
- Pokud parametr není ObjectId, hledá podle `slug` a `isActive=true`.
- Populuje `floorId`, `floorIds`, `categoryIds`.

### `POST /api/shops`

Vytvoření obchodu.

- Auth: `editor+`
- CSRF: ne
- Body: `shopCreateSchema`
- Slug se vygeneruje z názvu, pokud není zadán.

### `PUT /api/shops/:id`

Úprava obchodu.

- Auth: `editor+`
- CSRF: ne
- Body: `shopUpdateSchema`
- Při změně názvu bez ručního slugu se vygeneruje unikátní slug.

### `DELETE /api/shops/:id`

Smazání obchodu.

- Auth: `admin+`
- CSRF: ne

---

## Kategorie `/api/categories`

### `GET /api/categories`

Seznam kategorií.

- Auth: ne
- Query: `page`, `limit`, `sort`, `order`, `search`, `isActive`
- Navíc podporuje raw query `withShopsOnly=true`, která vrátí pouze kategorie s alespoň jedním aktivním obchodem.
- Response používá `pagination`.
- API dopočítává `shopCount`.

### `GET /api/categories/:id`

Detail kategorie.

- Auth: ne

### `POST /api/categories`

Vytvoření kategorie.

- Auth: `editor+`
- CSRF: ne
- Slug se vygeneruje, pokud není zadán.

### `PUT /api/categories/:id`

Úprava kategorie.

- Auth: `editor+`
- CSRF: ne

### `DELETE /api/categories/:id`

Smazání kategorie.

- Auth: `admin+`
- CSRF: ne
- API zabrání smazání, pokud je kategorie přiřazená k obchodům.

### `PUT /api/categories/reorder`

Změna pořadí kategorií.

- Auth: `editor+`
- CSRF: ne
- Body:

```json
{ "ids": ["..."] }
```

---

## Patra `/api/floors`

### `GET /api/floors`

Seznam pater.

- Auth: ne
- Query: `page`, `limit`, `sort`, `order`, `isActive`
- Default sort: `level`
- Response používá `pagination`
- API dopočítává `shopCount` přes legacy `floorId`.

### `GET /api/floors/:id`

Detail patra.

- Auth: ne

### `POST /api/floors`

Vytvoření patra.

- Auth: `editor+`
- Pokud body obsahuje `svgMap`, vyžaduje `superadmin`
- CSRF: ne

### `PUT /api/floors/:id`

Úprava patra.

- Auth: `editor+`
- Pokud body obsahuje `svgMap`, vyžaduje `superadmin`
- CSRF: ne

### `DELETE /api/floors/:id`

Smazání patra.

- Auth: `admin+`
- CSRF: ne
- Kontrola vazeb obchodů aktuálně používá legacy `floorId`.

### `PUT /api/floors/reorder`

Změna pořadí pater.

- Auth: `editor+`
- CSRF: ne
- Body:

```json
{ "ids": ["..."] }
```

---

## Mapa `/api/map`

### `GET /api/map/units`

Vrací jednotky mapy pro aktivní patra.

- Auth: ne
- Query: `floorId` volitelně
- Zdroj jednotek: SVG soubory z `Floor.svgMap`
- Obchody: aktivní obchody s `unitCodes` nebo legacy `unitCode`
- Soukromá obsazenost: `Floor.privateOccupiedUnitCodes`

Bez `floorId` vrací:

```json
{
  "floors": [],
  "totalUnits": 0,
  "occupiedUnits": 0,
  "staticAroundMap": null,
  "staticAroundMapContent": null
}
```

S `floorId` a jedním nalezeným patrem vrací přímo objekt patra.

---

## Akce `/api/events`

### `GET /api/events`

Seznam akcí.

- Auth: ne
- Query: `page`, `limit`, `sort`, `order`, `shopId`, `search`, `isActive`, `notExpired`
- Default sort: `sortOrder`
- Response používá `meta`, ne `pagination`
- Populuje `shopId` jako `shop`.

`notExpired=true` přidá filtr:

```js
displayUntil === null || displayUntil >= now
```

### `GET /api/events/:id`

Detail akce.

- Auth: ne

### `POST /api/events`

Vytvoření akce.

- Auth: `editor+`
- CSRF: ne
- Body: `eventCreateSchema`

### `PUT /api/events/:id`

Úprava akce.

- Auth: `editor+`
- CSRF: ne

### `DELETE /api/events/:id`

Smazání akce.

- Auth: `admin+`
- CSRF: ne

### `PUT /api/events/reorder`

Změna pořadí akcí.

- Auth: `editor+`
- CSRF: ne

### `POST /api/events/:id/publish`

Legacy endpoint.

- Auth: `editor+`
- Aktuální model `Event` nemá definované pole `published`; UI používá `isActive`.
- Nepoužívat jako primární publikační mechanismus.

### `POST /api/events/:id/unpublish`

Legacy endpoint se stejným omezením jako `publish`.

---

## Novinky `/api/news`

### `GET /api/news`

Seznam novinek.

- Auth: ne
- Query: `page`, `limit`, `sort`, `order`, `search`, `isActive`, `notExpired`
- Default sort: `sortOrder`
- Response používá `meta`

### `GET /api/news/:id`

Detail novinky.

- Auth: ne

### `POST /api/news`

Vytvoření novinky.

- Auth: `editor+`
- CSRF: ne

### `PUT /api/news/:id`

Úprava novinky.

- Auth: `editor+`
- CSRF: ne

### `DELETE /api/news/:id`

Smazání novinky.

- Auth: `admin+`
- CSRF: ne

### `PUT /api/news/reorder`

Změna pořadí novinek.

- Auth: `editor+`
- CSRF: ne

---

## Služby `/api/services`

### `GET /api/services`

Seznam služeb.

- Auth: ne
- Query: `page`, `limit`, `sort`, `order`, `search`, `isActive`
- Default sort: `sortOrder`
- Response používá `meta`

### `GET /api/services/:id`

Detail služby.

- Auth: ne

### `POST /api/services`

Vytvoření služby.

- Auth: `editor+`
- CSRF: ne

### `PUT /api/services/:id`

Úprava služby.

- Auth: `editor+`
- CSRF: ne

### `DELETE /api/services/:id`

Smazání služby.

- Auth: `admin+`
- CSRF: ne

### `PUT /api/services/reorder`

Změna pořadí služeb.

- Auth: `editor+`
- CSRF: ne

---

## General info `/api/general-info`

### `GET /api/general-info`

Vrací singleton `GeneralInfo`. Pokud neexistuje, vytvoří se přes `getOrCreate()`.

- Auth: ne

### `PUT /api/general-info`

Úprava singletonu.

- Auth: `editor+`
- Pokud body obsahuje `staticAroundMap`, vyžaduje `superadmin`
- CSRF: ne
- Body: `generalInfoUpdateSchema`

---

## Homepage `/api/homepage`

### `GET /api/homepage`

Vrací singleton `Homepage`.

- Auth: ne

### `PUT /api/homepage`

Úprava singletonu.

- Auth: `editor+`
- CSRF: ne
- Body:

```json
{
  "heroImage": "/api/uploads/...",
  "showHeroBorder": true
}
```

---

## Správci `/api/users`

### `GET /api/users`

Seznam CMS uživatelů.

- Auth: `admin+`
- CSRF: ne
- Query: `page`, `limit`, `sort`, `order`

### `GET /api/users/:id`

Detail uživatele.

- Auth: `admin+`
- CSRF: ne

### `POST /api/users`

Vytvoření uživatele.

- Auth: `admin+`
- CSRF: ano
- Superadmin roli může vytvořit pouze superadmin.

### `PUT /api/users/:id`

Úprava uživatele.

- Auth: `admin+`
- CSRF: ano
- Superadmin účet může upravit pouze superadmin.
- Superadmin roli může přiřadit pouze superadmin.

### `DELETE /api/users/:id`

Smazání uživatele.

- Auth: `admin+`
- CSRF: ano
- Nelze smazat vlastní účet.
- Admin nemůže smazat superadmin účet.
- Při smazání se invalidují sessions uživatele.

---

## Upload `/api/upload`

### `POST /api/upload`

Nahrání obrázku.

- Auth: `editor+`
- CSRF: ne
- Content-Type: `multipart/form-data`
- Field: `file`
- Povolené typy: JPEG, PNG, WebP, GIF, SVG
- Max velikost: 3 MB
- Název: UUID

Response:

```json
{
  "url": "/api/uploads/<uuid>.jpg",
  "filename": "<uuid>.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

---

## Upload serving `/api/uploads`

### `GET /api/uploads/:filename`

Servírování nahraného souboru.

- Auth: ne
- Kontroly:
  - zákaz `..`, `/`, `\`
  - whitelist přípon `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
  - UUID formát názvu
- Cache: `public, max-age=31536000, immutable`
- Používá `serveStatic`, podporuje metadata pro cache/range.

### `GET /uploads/:filename`

Server route mimo `/api`, která provádí 301 redirect na `/api/uploads/:filename`.

---

## Sitemap

### `GET /api/__sitemap__/urls`

Dynamické URL pro `@nuxtjs/sitemap`.

- Auth: ne
- Vrací aktivní obchody jako `/obchody/:slug`
- Akce a novinky nejsou v sitemapě, protože nemají vlastní detailní URL.

---

## Health check

### `GET /api/health`

Kontrola aplikace a databáze.

- Auth: ne
- Při úspěchu:

```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

- Při selhání DB vrací 503.

---

## Endpointy mimo registry

`tests/endpoints-registry.test.ts` záměrně ignoruje:

- `/api/__sitemap__/urls`
- `/api/uploads/:filename`

Tyto endpointy existují, ale jsou považované za interní/infrastrukturní pro účely registry testu.
