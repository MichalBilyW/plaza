# Deployment a provozni poznamky

Dokument popisuje produkcni provoz aplikace OC Plaza Liberec podle aktualniho kodu kveten 2026.

---

## Prehled

Aplikace je Nuxt 4 projekt s Nitro `node-server` presetem. Produkcni build vytvari `.output/` a spousti se pres Node.js:

```bash
node .output/server/index.mjs
```

Repo obsahuje:

- `Dockerfile` pro multi-stage Docker build,
- `nixpacks.toml` s install fazi pro Nixpacks/Railway/Coolify scenare,
- `scripts/health-check.mjs` jako verzovany post-deploy health check.

Projektove poznamky pocitaji s nasazenim na Hetzner serveru pres Coolify. Skutecny build pack v Coolify je potreba overit v Coolify projektu, protoze repo podporuje Dockerfile i Nixpacks.

---

## Runtime pozadavky

| Oblast | Pozadavek |
|---|---|
| Node.js | `>=22.12.0` |
| Databaze | MongoDB |
| Port aplikace | default `3000` |
| Host | default `0.0.0.0` v Docker runneru |
| Uploady | perzistentni volume pro `.output/public/uploads` |

---

## ENV promenne

### Povinne private promenne

| Promenna | Popis |
|---|---|
| `NUXT_MONGO_URI` | MongoDB connection string |
| `NUXT_JWT_SECRET` | silny nahodny JWT secret pro podepisovani tokenu |

### Volitelne private promenne

| Promenna | Default | Poznamka |
|---|---|---|
| `NUXT_JWT_EXPIRES_IN` | `7d` | nacita se do runtime configu, ale auth kod ji aktualne nepouziva |
| `NUXT_COOKIE_SECURE` | podle `NODE_ENV` | `false` pouze pro HTTP testovani mimo produkci |
| `NODE_ENV` | podle prostredi | produkce ma byt `production` |
| `HOST` | `0.0.0.0` v Dockeru | host Nitro serveru |
| `PORT` | `3000` | port Nitro serveru |

### Public promenne

Tyto hodnoty se dostanou i do klientského bundlu.

| Promenna | Default | Popis |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3000` | kanonicka URL webu |
| `NUXT_PUBLIC_DEFAULT_LOCALE` | `cs` | vychozi locale |
| `NUXT_PUBLIC_GTM_ID` | `GTM-WB3N3SCX` | Google Tag Manager ID |

Poznamky:

- Dockerfile ma build argumenty jen pro `NUXT_PUBLIC_SITE_URL` a `NUXT_PUBLIC_DEFAULT_LOCALE`.
- `NUXT_PUBLIC_GTM_ID` je pouzite v `nuxt.config.ts` a `app/plugins/gtm.ts`, ale v Dockerfile neni jako `ARG`.
- `.env.example` obsahuje `NUXT_PUBLIC_SITE_NAME` a `NUXT_PUBLIC_SITE_DESCRIPTION`, ale aktualni `nuxt.config.ts` ma tyto hodnoty zapsane natvrdo a ENV pro ne nepouziva.
- `.env.example` neobsahuje `NUXT_PUBLIC_GTM_ID`, prestoze ho kod pouziva.

---

## Lokální vyvoj

```bash
npm install
npm run dev
```

Dev server bezi pres `nuxt dev --host`, typicky na `http://localhost:3000`.

---

## Produkcni build mimo Docker

```bash
npm run build
npm start
```

`npm start` spousti:

```bash
node .output/server/index.mjs
```

---

## Dockerfile

`Dockerfile` ma tri stage:

| Stage | Popis |
|---|---|
| `deps` | `node:22-alpine`, instalace dependencies pres `npm ci --include=dev` |
| `builder` | kopie zdroju, build Nuxt aplikace, `npm prune --production` |
| `runner` | runtime image s `.output`, `node_modules`, `package.json` |

Runner:

- bezi jako neprivilegovaný uzivatel `nuxtjs`,
- instaluje `dumb-init`,
- vytvari `/app/.output/public/uploads`,
- vystavuje port `3000`,
- healthcheck pouziva `wget`, ne `curl`.

Healthcheck v Dockerfile:

```text
wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health
```

Priklad buildu:

```bash
docker build \
  --build-arg NUXT_PUBLIC_SITE_URL=https://ocplazaliberec.cz \
  --build-arg NUXT_PUBLIC_DEFAULT_LOCALE=cs \
  -t plaza:latest .
```

Pokud se ma menit GTM ID pri Docker buildu, je potreba ho resit pres Coolify/Nuxt runtime config nebo doplnit Dockerfile `ARG NUXT_PUBLIC_GTM_ID`.

---

## Nixpacks

`nixpacks.toml` aktualne definuje jen install fazi:

```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]
```

Build a start prikazy by v Nixpacks/Coolify prostredi mely byt overene primo v konfiguraci aplikace.

---

## Uploady v produkci

Upload endpoint uklada soubory v produkci do:

```text
/app/.output/public/uploads/
```

Tato slozka neni soucasti Git repozitare ani Docker obrazu. V produkci musi byt pripojena jako perzistentni volume. Projektove poznamky pouzivaji cestu:

```text
/data/plaza/uploads -> /app/.output/public/uploads
```

Bez perzistentniho volume by se nahrane obrazky/loga ztratily pri redeploymentu kontejneru.

---

## Health check

Endpoint:

```text
GET /api/health
```

Vraci zakladni stav aplikace.

Post-deploy script:

```bash
npm run health-check -- --url https://ocplazaliberec.cz
```

`scripts/health-check.mjs` kontroluje:

- `/api/health`,
- hlavni API kolekce,
- verejne stranky `/`, `/obchody`, `/mapa`, `/o-nas`.

---

## NPM skripty

| Prikaz | Popis | Poznamka |
|---|---|---|
| `npm run dev` | dev server | meni procesovy stav, nespoustet bez potreby |
| `npm run build` | produkcni Nuxt build | zapisuje `.output/` |
| `npm start` | spusteni produkcniho buildu | potrebuje existujici `.output/` |
| `npm test` | Vitest testy | |
| `npm run test:e2e` | Vitest s e2e konfiguraci | |
| `npm run typecheck` | Nuxt typecheck | |
| `npm run lint` | ESLint kontrola | |
| `npm run lint:fix` | ESLint autofix | meni soubory |
| `npm run format` | Prettier write | meni soubory |
| `npm run validate` | lint + typecheck + test | |
| `npm run predeploy` | validate + build | zapisuje build |
| `npm run health-check` | post-deploy kontrola | verzovany script |
| `npm run backup:db:local` | JSON zaloha lokalni DB | odkazuje na ignorovany TS script |
| `npm run backup:db:prod` | JSON zaloha produkcni DB | odkazuje na ignorovany TS script |
| `npm run restore:db` | obnova DB ze zalohy | destruktivni pro cilovou DB |
| `npm run sync:prod-to-local` | sync produkce do local | odkazuje na ignorovany TS script |
| `npm run cleanup:uploads:dry` | dry-run cleanup uploadu | odkazuje na ignorovany TS script |
| `npm run cleanup:uploads` | presun nepouzitych uploadu | meni soubory |

Dulezite: `scripts/*.ts` je v `.gitignore`. V aktualnim pracovnim adresari tyto provozni TS scripty existuji, ale nejsou verzovane Gitem. Pri cistem klonu repozitare bude verzovany pouze `scripts/health-check.mjs`, pokud se TS scripty nepredaji jinym zpusobem.

---

## Zaloha a obnova DB

Repo ma npm prikazy pro zalohy a obnovu, ale realne zalezi na tom, zda jsou k dispozici ignorovane TS scripty:

```bash
npm run backup:db:local
npm run backup:db:prod
npm run restore:db
```

Obnova databaze je destruktivni operace. Pred obnovou produkce musi byt udelana aktualni zaloha a musi byt jasne, na jakou `NUXT_MONGO_URI` prikaz miri.

Pro klienta a provoz je vhodne evidovat v `docs/klient-pristupy.md`:

- kde se zalohy ukladaji,
- jak casto se delaji,
- kdo ma pristup k MongoDB,
- jak obnovit data pri havarii,
- zda se zalohuji i uploady.

---

## MongoDB

`server/utils/db.ts` pouziva Mongoose a cachuje connection globalne, aby se v dev/HMR a SSR zbytecne nevytvarelo vice spojeni.

Konfigurace pripojeni:

```ts
mongoose.connect(mongoUri, {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

Modely jsou importovane v `db.ts`, aby byly registrovane pri prvnim pripojeni.

TTL indexy:

- `sessions.expiresAt`
- `ratelimits.expiresAt`

---

## Sitemap a robots

Sitemap je generovana pres `@nuxtjs/sitemap`.

Konfigurace:

- staticke URL jsou v `nuxt.config.ts`,
- dynamicke URL obchodů bere `/api/__sitemap__/urls`,
- cache sitemap je 24 hodin,
- vylouceno je `/cms`, `/cms/**`, `/api/**`, `/cookies`.

Endpoint:

```text
GET /sitemap.xml
```

Robots route je v `server/routes/robots.txt.ts`.

---

## CMS a SEO soukromi

CMS routes maji `X-Robots-Tag`:

```text
noindex, nofollow, noarchive, nosnippet, noimageindex
```

CMS je chranene middlewarem `app/middleware/cms.ts`, ktere nacita `/api/auth/me` a pri chybe presmeruje na `/cms/login`.

---

## Predprodukcni checklist

- Nastavit produkcni `NUXT_MONGO_URI`.
- Nastavit silny `NUXT_JWT_SECRET`.
- Nastavit `NUXT_PUBLIC_SITE_URL=https://ocplazaliberec.cz`.
- Overit GTM ID a pripadne `NUXT_PUBLIC_GTM_ID`.
- Overit, ze cookie secure flag je v produkci aktivni.
- Overit perzistentni volume pro uploady.
- Overit zalohy databaze a uploadu mimo kontejner.
- Overit DNS a SSL certifikat.
- Provest health check po nasazeni.
- Projit CMS login a zakladni editaci obsahu.
- Otevrit `/sitemap.xml` a `/robots.txt`.
- Zkontrolovat, ze `/cms` neni indexovatelne.

---

## Provozni rizika

1. **Uploady zavisi na volume.** Bez volume se pri redeployi ztrati obrazky.

2. **TS provozni scripty nejsou verzovane.** Pokud maji byt soucasti predavky, musi byt ulozene mimo Git nebo upraven `.gitignore`/repo politika.

3. **GTM ID neni Docker ARG.** Pokud se ma menit pri buildu, je potreba upravit Dockerfile nebo Coolify konfiguraci.

4. **`NUXT_JWT_EXPIRES_IN` nema prakticky efekt.** Auth kod pouziva 7 dni.

5. **Zalohy musi zahrnovat DB i uploady.** DB sama nestaci, protoze obrazky jsou na filesystemu.
