# Deployment a provozní poznámky

---

## Přehled

Aplikace je nasazena jako Docker kontejner s multi-stage buildem. Infrastruktura běží na **Hetzner serveru** přes **Coolify** (self-hosted PaaS). Alternativně lze nasadit přes **Railway** (viz `nixpacks.toml`).

---

## ENV proměnné

Všechny citlivé hodnoty musí být nastaveny jako ENV proměnné v prostředí nasazení.

### Povinné (server-only)

| Proměnná | Popis |
|---|---|
| `NUXT_MONGO_URI` | MongoDB connection string (např. `mongodb+srv://...`) |
| `NUXT_JWT_SECRET` | Tajný klíč pro JWT podepisování – **musí být silný v produkci!** |

### Volitelné (server-only)

| Proměnná | Výchozí | Popis |
|---|---|---|
| `NUXT_JWT_EXPIRES_IN` | `7d` | Expirace JWT access tokenu |
| `NUXT_COOKIE_SECURE` | *(dle NODE_ENV)* | `false` pro HTTP přístup v dev/staging |

### Veřejné (public – baked do klientského bundlu při buildu)

| Proměnná | Výchozí | Popis |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Kanonická URL webu (pro SEO, OG tagy) |
| `NUXT_PUBLIC_DEFAULT_LOCALE` | `cs` | Výchozí locale |
| `NUXT_PUBLIC_GTM_ID` | `GTM-WB3N3SCX` | Google Tag Manager ID |

> **Důležité:** `NUXT_PUBLIC_SITE_URL` a `NUXT_PUBLIC_DEFAULT_LOCALE` jsou ARG/ENV v Dockerfile a musí být nastaveny jako build argumenty, nikoli jen runtime ENV.

---

## Build a spuštění

### Lokální vývoj

```bash
npm install
npm run dev          # Spustí dev server na http://localhost:3000 (host: 0.0.0.0)
```

### Produkční build (lokálně)

```bash
npm run build        # Nuxt build → .output/
npm start            # node .output/server/index.mjs
```

### Docker

```bash
# Build image
docker build \
  --build-arg NUXT_PUBLIC_SITE_URL=https://ocplazaliberec.cz \
  -t plaza:latest .

# Spuštění
docker run -d \
  -p 3000:3000 \
  -e NUXT_MONGO_URI="mongodb+srv://..." \
  -e NUXT_JWT_SECRET="super-secret" \
  plaza:latest
```

### Nixpacks (Railway)

```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]
```

Railway automaticky detekuje Nuxt a provede build + spuštění.

---

## Dockerfile – struktura

Multi-stage build (`Dockerfile`):

```
Stage 1: deps
  - node:22-alpine
  - Instalace python3, make, g++ (native moduly – bcrypt)
  - npm ci --include=dev

Stage 2: builder
  - Kopíruje node_modules z deps
  - Nastaví ENV pro build (NODE_ENV=production, NUXT_PUBLIC_*)
  - npm run build → .output/
  - npm prune --production

Stage 3: runner
  - node:22-alpine
  - dumb-init jako PID 1
  - Neprivilegovaný uživatel nuxtjs (UID 1001)
  - Kopíruje pouze .output/, node_modules/, package.json
  - Vytvoří /app/.output/public/uploads/ s právy pro nuxtjs
  - EXPOSE 3000
  - HEALTHCHECK: curl http://127.0.0.1:3000/api/health
```

---

## Uploads v produkci

Nahrané soubory jsou ukládány do:
```
/app/.output/public/uploads/
```

Tato složka **není součástí Git repozitáře** ani Docker obrazu. Musí být zajištěna perzistence přes Docker volume:

```bash
docker run -v /data/plaza/uploads:/app/.output/public/uploads ...
```

Na produkčním serveru je cesta ke složce konfigurována v Coolify.

---

## Zdravotní kontrola

```
GET /api/health
```

Používá:
- Docker `HEALTHCHECK` (v Dockerfile) – každých 30s, timeout 10s, 3 pokusy
- Post-deploy skript `scripts/health-check.mjs`

### Post-deploy health check

```bash
npm run health-check -- --url https://ocplazaliberec.cz
```

Skript zkontroluje:
- `/api/health` – response `{ status: 'ok' }`
- `/api/shops`, `/api/categories`, `/api/floors`, `/api/events`, `/api/services` – existence pole `data`
- Stránky `/`, `/obchody`, `/mapa`, `/o-nas` – HTTP 200 + přítomnost `<html>`

---

## Záloha a obnova databáze

### Záloha lokální DB

```bash
npm run backup:db:local
# Výstup: mongo-backup/local/YYYY-MM-DD_HH-MM-SS/
```

### Záloha produkční DB

```bash
npm run backup:db:prod
# Vyžaduje NUXT_MONGO_URI nastavenou v prostředí
# Výstup: mongo-backup/production/YYYY-MM-DD_HH-MM-SS/
```

Zálohy jsou JSON soubory (`kolekce.json`) + metadata (`_meta.json`).

### Obnova ze zálohy

```bash
NUXT_MONGO_URI="mongodb+srv://..." npx tsx scripts/restore-db.ts mongo-backup/local/2026-04-19_16-50-38
```

> **Varování:** Obnova **SMAŽE** obsah existujících kolekcí a naplní je daty ze zálohy. Nelze vrátit zpět.

Skript automaticky převede hex ObjectId stringy zpět na Mongoose `Types.ObjectId` objekty.

---

## Cleanup uploadů

Skript `scripts/cleanup-uploads-prod.ts` prohledá produkční DB (včetně HTML obsahu) a identifikuje soubory, které nejsou referencovány v žádném záznamu.

```bash
# Suchý běh – pouze výpis, nic nepřesune
npm run cleanup:uploads:dry

# Skutečný cleanup – přesune nepoužité soubory do archivu
npm run cleanup:uploads
```

Skript se připojí k produkční DB a porovná nahrané soubory se záznamy v databázi.

---

## Skripty npm

| Příkaz | Popis |
|---|---|
| `npm run dev` | Dev server s HMR |
| `npm run build` | Produkční build |
| `npm start` | Spustí build (`.output/server/index.mjs`) |
| `npm test` | Vitest testy |
| `npm run test:e2e` | E2E testy |
| `npm run typecheck` | TypeScript kontrola |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint s auto-fix |
| `npm run format` | Prettier |
| `npm run validate` | lint + typecheck + test |
| `npm run predeploy` | validate + build |
| `npm run health-check` | Post-deploy kontrola |
| `npm run backup:db:local` | Záloha lokální DB |
| `npm run backup:db:prod` | Záloha produkční DB |
| `npm run restore:db` | Obnova DB ze zálohy |
| `npm run cleanup:uploads:dry` | Dry-run cleanup uploadů |
| `npm run cleanup:uploads` | Cleanup uploadů |

---

## MongoDB připojení

**Soubor:** `server/utils/db.ts`

Připojení je cacherováno globálně (pro SSR i HMR v dev):

```typescript
mongoose.connect(mongoUri, {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

Všechny modely jsou importovány v `db.ts` a registrovány při prvním připojení. Tím se zabrání problémům s tree-shakingem v produkčním buildu.

---

## Sitemap

Sitemap je generována automaticky přes `@nuxtjs/sitemap`:

- Statické URL definovány v `nuxt.config.ts`
- Dynamické URL obchodů z `GET /api/__sitemap__/urls`
- Cache: 24 hodin (`cacheMaxAgeSeconds: 86400`)
- CMS stránky a `/cookies` jsou vyloučeny

```
GET /sitemap.xml
```

---

## Provozní poznámky

1. **Uploads perzistence** – při každém redeploymentu z Dockeru se nesmí přijít o `/data/plaza/uploads`. Musí být namountovaný Docker volume.

2. **MongoDB Atlas TTL index** – Session model má TTL index na `expiresAt`. MongoDB automaticky maže expirované sessions. Tato operace probíhá přibližně každých 60 sekund.

3. **Rate limiter** – Rate limit záznamy jsou uloženy v MongoDB (kolekce `ratelimits`), přežívají restart aplikace. TTL index zajišťuje automatické mazání prošlých záznamů.

4. **Node.js verze** – Projekt vyžaduje Node.js >=22.12.0 (`engines` v `package.json`).

5. **Timezone** – Server by měl běžet v UTC. Otevírací hodiny jsou ukládány bez timezone informace (HH:mm stringy). Logika `isCurrentlyOpen` v `/api/map/units` používá `new Date()` na serveru.
