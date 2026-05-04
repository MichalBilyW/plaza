# Bezpecnostni mechanismy

Tento dokument popisuje realny stav bezpecnosti v kodu kveten 2026. Nejde o idealni navrh, ale o popis toho, co aplikace skutecne dela.

---

## Prehled vrstev

```
HTTP request
  -> login rate limit / MongoDB RateLimit
  -> JWT autentizace z cookie nebo Authorization headeru
  -> role check: requireEditor / requireAdmin / requireSuperAdmin
  -> vybrane CSRF kontroly
  -> Zod validace vstupu
  -> business logika a MongoDB operace
```

Hlavni soubory:

| Oblast | Soubor |
|---|---|
| JWT, cookies, role, bcrypt | `server/utils/auth.ts` |
| CSRF | `server/utils/csrf.ts` |
| Rate limit | `server/utils/rateLimit.ts`, `server/models/RateLimit.ts` |
| DB pripojeni | `server/utils/db.ts` |
| Validace vstupu | `shared/schemas/index.ts` |
| CMS middleware | `app/middleware/cms.ts` |

---

## Autentizace

CMS pouziva JWT access token a nahodny refresh token ulozene v HTTP-only cookies.

Pri prihlaseni:

1. `POST /api/auth/login` zkontroluje rate limit podle IP.
2. Najde aktivniho uzivatele podle e-mailu.
3. Ověri heslo pres bcrypt.
4. Vytvori zaznam v kolekci `sessions`.
5. Vygeneruje access token s `sessionId`.
6. Vygeneruje refresh token a ulozi jeho hash do session.
7. Nastavi cookies `access_token`, `refresh_token` a `csrf_token`.

JWT payload obsahuje:

```ts
{
  id: string
  email: string
  name: string
  role: 'editor' | 'admin' | 'superadmin'
  sessionId: string
}
```

Access token je platny 7 dni. `NUXT_JWT_EXPIRES_IN` je sice nactene v `nuxt.config.ts`, ale aktualni `getJwtConfig()` v `server/utils/auth.ts` ho nepouziva. Realna platnost tokenu je tedy hardcodovana na `7d`.

---

## Cookies

| Cookie | httpOnly | sameSite | secure | Platnost | Ucel |
|---|---|---|---|---|---|
| `access_token` | ano | `lax` | produkce ano | 7 dni | JWT pro API pristup |
| `refresh_token` | ano | `lax` | produkce ano | 7 dni | obnova access tokenu |
| `csrf_token` | ne | `lax` | produkce ano | 24 hodin | token pro `X-CSRF-Token` header |

`secure` flag se nastavuje podle `NODE_ENV === 'production'`, pokud neni vynucene `NUXT_COOKIE_SECURE=false`.

`clearAuthCookies()` maze pouze `access_token` a `refresh_token`. CSRF cookie se pri odhlaseni explicitne nemaze.

---

## Session management

Kazde prihlaseni vytvori dokument v kolekci `sessions`.

Session obsahuje:

- `userId`
- hash refresh tokenu
- `userAgent`
- `ipAddress`
- `lastActivityAt`
- `expiresAt`
- `isValid`

TTL index na `expiresAt` maze expirovane sessions automaticky na strane MongoDB.

API umi:

| Endpoint | Popis |
|---|---|
| `GET /api/auth/sessions` | vypis aktivnich sessions aktualniho uzivatele |
| `DELETE /api/auth/sessions/:id` | zneplatni konkretni session |
| `DELETE /api/auth/sessions` | zneplatni vsechny ostatni sessions |

V CMS existuje composable API (`useCmsAuth().getSessions()` apod.), ale v aktualnim UI neni samostatna obrazovka pro spravu sessions.

---

## Refresh token rotation

`POST /api/auth/refresh` pri kazde obnove:

1. vezme refresh token z cookie,
2. najde validni session podle hashe tokenu,
3. zneplatni stary token,
4. ulozi novy refresh token hash,
5. vyda novy access token,
6. nastavi nove cookies.

Pokud server najde refresh token, ktery uz byl rotovan a neni validni, vyhodnoti to jako mozne odcizeni tokenu a zneplatni vsechny sessions daneho uzivatele.

---

## Role a autorizace

Role:

| Role | Uroven |
|---|---|
| `editor` | sprava obsahu |
| `admin` | sprava obsahu a beznych spravcu |
| `superadmin` | nejvyssi opravneni, technicke a vlastnicke nastaveni |

Serverove helpery:

| Helper | Povoli |
|---|---|
| `requireAuth` | prihlaseny uzivatel |
| `requireEditor` | `editor`, `admin`, `superadmin` |
| `requireAdmin` | `admin`, `superadmin` |
| `requireSuperAdmin` | pouze `superadmin` |

Typicky stav:

- vytvareni a editace obsahu: `editor+`
- mazani obsahu: vetsinou `admin+`
- sprava uzivatelu: `admin+`
- editace SVG mapy a statickeho okoli mapy: `superadmin`

Admin muze spravovat role `editor` a `admin`. Superadmin muze spravovat vsechny role.

---

## Rate limiting

Rate limiter je ulozeny v MongoDB, ne v pameti procesu.

Soubory:

- `server/utils/rateLimit.ts`
- `server/models/RateLimit.ts`

Kolekce:

- `ratelimits`

Konfigurace v kodu:

| Profil | Okno | Max pokusu | Blokace |
|---|---:|---:|---:|
| `login` | 15 minut | 5 | 30 minut |
| `passwordReset` | 60 minut | 3 | 60 minut |
| `api` | 1 minuta | 100 | 1 minuta |

Aktualne je realne pouzity jen `login` profil na `POST /api/auth/login`.

Protoze je stav v MongoDB, rate limit prezije restart aplikace a funguje i pri vice instancich, pokud sdili stejnou databazi. Pokud je MongoDB nedostupna, login stejne selze kvuli zavislosti na databazi.

---

## CSRF ochrana

CSRF implementace je Double Submit Cookie pattern:

1. server nastavi `csrf_token` cookie,
2. frontend prida stejnou hodnotu do `X-CSRF-Token`,
3. server porovna cookie a header pres `crypto.timingSafeEqual()`.

Aktualni realne pouziti `requireCsrf(event)`:

| Endpointy | Stav |
|---|---|
| `POST /api/auth/change-password` | CSRF vyzadovano |
| `POST /api/users` | CSRF vyzadovano |
| `PUT /api/users/:id` | CSRF vyzadovano |
| `DELETE /api/users/:id` | CSRF vyzadovano |

Ostatni write endpointy CSRF explicitne nevolaji a spolehaji na `sameSite: lax` cookies, JWT autentizaci a role check. To je pro bezne cross-site formulare solidni ochrana, ale neni to konzistentni ochrana vsech state-changing API.

---

## Hesla

Hesla se ukladaji jako bcrypt hash.

| Vlastnost | Hodnota |
|---|---|
| Knihovna | `bcryptjs` |
| Salt rounds | 12 |
| DB pole | `User.password` |
| Default select | `select: false` |

Heslo se z databaze nacita jen tam, kde je explicitne potreba `.select('+password')`, typicky pri loginu nebo zmene hesla.

Zmena hesla:

- vyzaduje aktualni heslo,
- vyzaduje CSRF,
- ulozi novy bcrypt hash,
- nezneplatni ostatni sessions.

Pokud chce provozovatel po zmene hesla odhlasit ostatni zarizeni, je potreba doplnit serverovou logiku nebo pouzit session revoke endpointy.

---

## Validace vstupu

Vstupy API jsou validovane pres Zod schemata ve `shared/schemas/index.ts`.

Pouzivaji se napr.:

- `objectIdSchema`
- `slugSchema`
- `emailSchema`
- `timeSchema`
- schema pro obchody, kategorie, patra, akce, novinky, sluzby, uzivatele a singleton obsah.

Validace je sdilena mezi serverem a frontendem, takze CMS formular i API vychazeji ze stejne definice dat.

---

## Uploady

Upload endpoint:

- `POST /api/upload`
- vyzaduje `editor+`
- max velikost: 3 MB
- povolene MIME typy: JPEG, PNG, WEBP, GIF, SVG
- nazev souboru je UUID
- v developmentu uklada do `public/uploads`
- v produkci uklada do `.output/public/uploads`

Servirovani:

- `GET /api/uploads/:filename`
- kontrola path traversal (`..`, `/`, `\`)
- kontrola UUID formatu
- whitelist pripon `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- immutable cache headers

Legacy cesta `/uploads/:filename` presmeruje na `/api/uploads/:filename`.

Poznamka k SVG: SVG je povoleny format. Je prakticky pro loga, ale z bezpecnostniho pohledu je citlivejsi nez rastrové obrazky. Soucasny endpoint kontroluje nazev, priponu a MIME typ, ale neprovadi sanitizaci obsahu SVG.

---

## XSS a HTML obsah

CMS WYSIWYG uklada HTML do databaze. Frontend pouziva `useSanitizeHtml()` a DOMPurify pred renderovanim obsahu do DOM.

Důležitá realita:

- na klientovi se HTML sanitizuje,
- na serveru pri SSR composable vraci raw HTML, protoze DOMPurify potrebuje DOM,
- obsah pochazi z CMS, tedy z duveryhodnych administracnich uctu.

Riziko je nizke, ale neni nulove. Pokud by se do CMS dostal neduveryhodny uzivatel nebo skodlivy HTML obsah pres databazi, muze SSR predstavovat slabsi misto.

---

## CMS noindex a soukromi administrace

CMS stranky maji v `nuxt.config.ts` route rules s hlavickou:

```text
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex
```

Sitemap vylucuje:

- `/cms`
- `/cms/**`
- `/api/**`
- `/cookies`

`/api/**` ma v route rules povolene CORS (`cors: true`).

---

## GTM a cookies

Google Tag Manager se nacita pres `app/plugins/gtm.ts`.

Realne chovani:

- GTM se nenacita na `/cms/*`,
- vychozi Google Consent Mode v2 je `denied`,
- GTM ID je `NUXT_PUBLIC_GTM_ID`, fallback `GTM-WB3N3SCX`,
- cookie lista je Silktide Cookie Manager,
- cookie lista se nenacita v CMS.

Kategorie cookies v kodu:

| ID | Nazev |
|---|---|
| `nezbytn` | Nezbytne |
| `analytick` | Analyticke |
| `reklamn_a_personaliza_n` | Reklamni a personalizacni |

Hotjar neni v kodu vlozen primo. Pokud se pouziva, bude pravdepodobne spravovany pres GTM.

---

## ENV a secrets

Private runtime config:

| Promenna | Popis | Default |
|---|---|---|
| `NUXT_MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/plaza` |
| `NUXT_JWT_SECRET` | JWT podpisovy secret | `dev-secret-change-in-production` |
| `NUXT_JWT_EXPIRES_IN` | nacteno do runtime configu, auth ho realne nepouziva | `7d` |
| `NUXT_COOKIE_SECURE` | override secure cookie flagu | prazdne |

Public runtime config:

| Promenna | Popis | Default |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | kanonicka URL webu | `http://localhost:3000` |
| `NUXT_PUBLIC_DEFAULT_LOCALE` | vychozi locale | `cs` |
| `NUXT_PUBLIC_GTM_ID` | GTM kontejner | `GTM-WB3N3SCX` |

Kriticke pro produkci:

- `NUXT_JWT_SECRET` musi byt nahodny silny secret a nesmi zustat dev default.
- `NUXT_MONGO_URI` nesmi byt commitnuty do repozitare.
- `.env` a `.env.prod` musi zustat mimo Git.
- Novy `docs/klient-pristupy.md` je v `.gitignore`, protoze muze obsahovat citlive udaje.

---

## Docker bezpecnost

`Dockerfile` pouziva multi-stage build:

- `deps` stage instaluje dependencies,
- `builder` stage provadi Nuxt build,
- `runner` stage obsahuje runtime aplikaci.

Runner:

- bezi pod neprivilegovaným uzivatelem `nuxtjs` UID 1001,
- pouziva `dumb-init`,
- vytvari `/app/.output/public/uploads`,
- healthcheck vola `wget --spider http://127.0.0.1:3000/api/health`.
