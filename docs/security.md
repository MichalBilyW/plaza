# Bezpečnostní mechanismy

---

## Přehled bezpečnostních vrstev

```
┌─────────────────────────────────────────────────────────────┐
│                   HTTP Request                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Rate Limiting (server/utils/rateLimit.ts)               │
│     Blokuje brute-force útoky na přihlášení                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. JWT Autentizace (server/utils/auth.ts)                  │
│     Ověří access_token z cookie nebo Authorization headeru  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CSRF Ochrana (server/utils/csrf.ts)                     │
│     Double Submit Cookie pattern – jen pro write operace    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Autorizace (role check)                                 │
│     requireEditor / requireAdmin / requireSuperAdmin        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Validace vstupů (Zod schémata)                         │
│     Každý endpoint validuje body/query před zpracováním     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Business logika + DB operace                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Rate Limiting

**Soubor:** `server/utils/rateLimit.ts`

### Implementace

MongoDB-based store (kolekce `ratelimits`). Klíč je kombinace prefixu a IP adresy (`login:192.168.1.1`).

Začátky sérií úspěšných pokusů jsou automaticky mazány MongoDB TTL indexem na poli `expiresAt`.

IP adresa se čte přes `getRequestIP(event, { xForwardedFor: true })` – respektuje `X-Forwarded-For` pro proxy.

### Konfigurace

| Konfigurace | windowMs | maxAttempts | blockDurationMs |
|---|---|---|---|
| `login` | 15 min | 5 | 30 min |
| `passwordReset` | 60 min | 3 | 60 min |
| `api` | 1 min | 100 | 1 min |

### Aktuálně použito

- `POST /api/auth/login` → konfigurace `login`
- Ostatní endpointy rate limiting neimplementují

### Rizika

- Při horizontálním škálování (více instancí) sdílí stav přes MongoDB – funguje správně
- Při nedöstupnosti MongoDB se rate limit check nezpracuje a login selhá (stejné chování jako selhavší `User.findOne()`)

---

## 2. Hesla

**Soubor:** `server/utils/auth.ts`

- Algoritmus: **bcrypt** (`bcryptjs` package)
- Salt rounds: **12** (bezpečný standard, cca 300ms na hash)
- `select: false` na poli `password` v User modelu – heslo není vráceno v žádném dotazu pokud není explicitně požadováno `.select('+password')`

---

## 3. JWT Tokeny

**Soubor:** `server/utils/auth.ts`

- Algoritmus: HS256 (výchozí `jsonwebtoken`)
- Secret: `NUXT_JWT_SECRET` (povinná ENV proměnná, v dev `dev-secret-change-in-production`)
- Expirace access tokenu: **7 dní**
- Payload: `{ id, email, name, role, sessionId }`

> **Riziko:** Dokumentace uvádí 15 min pro access token – skutečný kód používá 7 dní. Kratší expirace access tokenu by zvýšila bezpečnost (kompromitovaný token by byl platný kratší dobu).

---

## 4. Cookies

| Cookie | httpOnly | sameSite | secure | Popis |
|---|---|---|---|---|
| `access_token` | `true` | `lax` | prod: `true` | JWT – neidentifikovatelný z JS |
| `refresh_token` | `true` | `lax` | prod: `true` | Rotovaný token – neidentifikovatelný z JS |
| `csrf_token` | `false` | `lax` | prod: `true` | Čitelný z JS pro CSRF header |

- `secure` závisí na `NUXT_COOKIE_SECURE=false` (override) nebo `NODE_ENV === 'production'`
- `sameSite: lax` chrání před většinou CSRF útoků přes cross-site formuláře

---

## 5. CSRF Ochrana

**Soubor:** `server/utils/csrf.ts`
**Pattern:** Double Submit Cookie

### Tok:
1. Server nastaví `csrf_token` cookie (non-httpOnly → čitelný JS)
2. Frontend čte token z cookie a přidá ho do `X-CSRF-Token` headeru
3. Server porovná token z cookie s tokenem z headeru
4. Porovnání probíhá přes `crypto.timingSafeEqual()` – ochrana proti timing attacks

### Kde se používá:
- `POST /api/auth/change-password` – explicitní `requireCsrf(event)`
- Ostatní write endpointy (POST, PUT, DELETE) většinou `requireCsrf` nevolají – spoléhají na `sameSite: lax` cookie a JWT autentizaci

> **Nutné ověřit:** Konzistentnost CSRF ochrany přes všechny write endpointy. V kódu byl nalezen `requireCsrf` pouze na `change-password` endpointu.

---

## 6. Token Theft Detection

**Soubor:** `server/api/auth/refresh.post.ts`

Pokud někdo použije refresh token, který byl již dříve rotován (tedy odcizený starý token):
1. Server najde Session se starým refresh tokenem (bez `isValid: true` filtru)
2. Pokud existuje → **invaliduje VŠECHNY sessions** daného userId
3. Smaže cookies
4. Vrátí 401

---

## 7. Validace vstupů (Zod)

**Soubor:** `shared/schemas/index.ts`

Všechny API endpointy validují vstupy přes Zod schémata před zpracováním. Validace sdílí kód se serverem i frontendem.

Klíčové validátory:
- `objectIdSchema` – MongoDB ObjectId regex
- `slugSchema` – pouze `[a-z0-9-]`
- `emailSchema` – email formát
- `timeSchema` – HH:mm formát
- `urlSchema`, `phoneSchema` – prázdný string = nezadáno (volitelné pole)

---

## 8. Upload bezpečnost

**Soubory:** `server/api/upload/index.post.ts`, `server/api/uploads/[filename].get.ts`

### Upload (`POST /api/upload`):
- Whitelist MIME typů: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- Maximální velikost: 3 MB
- Název souboru generován jako UUID (předchází name collision a path traversal)
- Vyžaduje autentizaci (`editor+`)

### Servírování (`GET /api/uploads/:filename`):
- Path traversal ochrana: `..`, `/`, `\` v názvu → 400
- Whitelist přípon: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- UUID formát validován regexem
- Cache headers: `immutable` – UUID zabrání přepsání existujícího souboru jiným obsahem

---

## 9. XSS Ochrana

**Soubor:** `app/composables/useSanitizeHtml.ts`

HTML obsah z WYSIWYG editoru (uložen v DB jako raw HTML) je na frontendu sanitizován přes **DOMPurify** před renderováním do DOM.

Povolené tagy: `p, br, b, strong, i, em, u, s, h1-h6, ul, ol, li, a, img, table, ...`
Povolené atributy: `href, target, rel, src, alt, style, class, colspan, ...`
`javascript:` URL jsou zakázány.

> **Omezení:** Na serveru (SSR) DOMPurify nevyžaduje DOM → sanitizace se přeskočí a vrátí se raw HTML. Data pocházejí z vlastní DB → akceptovatelné riziko, ale stojí za sledování.

---

## 10. Bezpečnost servírování souborů

Nahrané soubory jsou servírovány přes vlastní endpoint `/api/uploads/:filename`, nikoli z veřejného adresáře přímo (v produkci `.output/public/uploads`). Endpoint:
- Kontroluje existenci souboru
- Validuje příponu a UUID formát
- Nastavuje správné Content-Type headery
- Nenabízí directory listing

---

## 11. Secrets a ENV

Citlivé hodnoty jsou čteny výhradně z ENV proměnných:

| Proměnná | Popis | Dev default |
|---|---|---|
| `NUXT_MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/plaza` |
| `NUXT_JWT_SECRET` | JWT signing secret | `dev-secret-change-in-production` |
| `NUXT_JWT_EXPIRES_IN` | JWT expirace | `7d` |
| `NUXT_COOKIE_SECURE` | Override secure cookie flag | – |

> **Kritické:** Dev default JWT secret musí být přepsán v produkci. Bez toho by byl JWT token podepsatelný na jakémkoli vývojovém stroji.

---

## 12. Docker bezpečnost

**Soubor:** `Dockerfile`

- Multi-stage build – výsledný obraz neobsahuje devDependencies
- Aplikace běží pod neprivilegovaným uživatelem `nuxtjs` (UID 1001)
- Používá `dumb-init` jako PID 1 (správné zpracování signálů, zombies)
- Neobsahuje shell utilsNástroje jako `sh`, pokud nejsou nutné (Alpine base)

---

## Technický dluh / rizika

1. **Access token expirace 7 dní** – při kompromitaci tokenu má útočník přístup po celou dobu, dokud neproběhne refresh. Doporučení: zkrátit na 15–60 minut a spoléhat na refresh mechanismus.

2. **CSRF ochrana není konzistentní** – `requireCsrf` je použit pouze na `change-password`. Ostatní write endpointy (CRUD) spoléhají na `sameSite: lax` cookies a JWT, což je dostačující, ale stojí za přidání CSRF ochrany na všechny state-changing endpointy.

3. **SSR XSS** – DOMPurify přeskakuje sanitizaci na serveru. Data pocházejí z vlastní DB spravované přes CMS, takže riziko je nízké, ale v případě SQL/NoSQL injection do DB by obsah mohl být zranitelný.
