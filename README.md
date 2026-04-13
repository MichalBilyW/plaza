# 🏢 OC Plaza Liberec

Webová prezentace a CMS pro nákupní centrum OC Plaza Liberec.

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Tech Stack

| Kategorie      | Technologie                                                         | Účel                           |
| -------------- | ------------------------------------------------------------------- | ------------------------------ |
| **Framework**  | [Nuxt 4](https://nuxt.com)                                          | Full-stack SSR framework       |
| **Runtime**    | Node.js 22                                                          | JavaScript runtime             |
| **Databáze**   | [MongoDB](https://mongodb.com) + [Mongoose](https://mongoosejs.com) | Document database s ODM        |
| **Styling**    | [TailwindCSS](https://tailwindcss.com)                              | Utility-first CSS              |
| **Formuláře**  | [FormKit](https://formkit.com)                                      | Vue form framework             |
| **Lokalizace** | [@nuxtjs/i18n](https://i18n.nuxtjs.org)                             | Internacionalizace (cs/en)     |
| **Validace**   | [Zod](https://zod.dev)                                              | Schema validace                |
| **Auth**       | JWT + bcrypt                                                        | Autentizace s httpOnly cookies |
| **Testy**      | [Vitest](https://vitest.dev)                                        | Unit testy                     |
| **Linting**    | ESLint + Prettier                                                   | Code quality                   |
| **Deploy**     | Docker / [Coolify](https://coolify.io)                              | Kontejnerizace a hosting       |

## 📁 Struktura projektu

```
plaza/
├── app/                    # Nuxt 4 app složka
│   ├── assets/css/         # Globální CSS
│   ├── components/         # Vue komponenty
│   │   ├── cms/            # CMS komponenty
│   │   ├── homepage/       # Homepage komponenty
│   │   ├── layout/         # Layout komponenty
│   │   ├── shop/           # Shop komponenty
│   │   └── ui/             # UI komponenty
│   ├── composables/        # Vue composables
│   ├── layouts/            # Nuxt layouts
│   ├── middleware/         # Route middleware
│   └── pages/              # Nuxt stránky
│       ├── cms/            # CMS administrace
│       └── obchody/        # Veřejné stránky obchodů
├── i18n/locales/           # Lokalizace (cs)
├── lib/                    # Pomocné knihovny
│   └── apiClient.ts        # Centralizovaný API klient
├── public/                 # Statické soubory
│   └── uploads/            # Nahrané obrázky (dev)
├── server/                 # Nitro server
│   ├── api/                # API endpointy (58 celkem)
│   ├── models/             # Mongoose modely
│   ├── plugins/            # Server plugins
│   ├── routes/             # Server routes
│   └── utils/              # Server utilities
├── shared/                 # Sdílené mezi client/server
│   ├── api/endpoints.ts    # Endpoints registry (SSOT)
│   ├── schemas/            # Zod schémata
│   └── types/              # TypeScript typy
├── scripts/                # Utility skripty
├── tests/                  # Vitest testy
├── formkit.config.ts       # FormKit konfigurace
├── nuxt.config.ts          # Nuxt konfigurace
├── tailwind.config.ts      # Tailwind konfigurace
└── Dockerfile              # Docker build
```

## ⚡ Rychlý start

### Požadavky

- Node.js 22+
- MongoDB 6+ (lokálně nebo Atlas)
- npm / pnpm / yarn

### Instalace

```bash
# Klonovat repozitář
git clone <repo-url>
cd plaza

# Instalovat závislosti
npm install

# Zkopírovat environment proměnné
cp .env.example .env

# Upravit .env dle potřeby
nano .env
```

### Spuštění

```bash
# Vývojový server (http://localhost:3000)
npm run dev

# Produkční build
npm run build

# Preview produkčního buildu
npm run preview
```

### Testování

```bash
# Spustit testy
npm run test

# Testy s watch mode
npm run test:watch

# Testy s coverage
npm run test:coverage
```

### Linting

```bash
# Kontrola kódu
npm run lint

# Automatická oprava
npm run lint:fix

# Formátování
npm run format
```

## 🔐 Environment proměnné

Všechny proměnné jsou definovány v `.env.example`. Nuxt používá prefix konvenci:

| Prefix         | Typ     | Přístup         |
| -------------- | ------- | --------------- |
| `NUXT_`        | Private | Pouze server    |
| `NUXT_PUBLIC_` | Public  | Client + server |

### Povinné proměnné

```env
# Databáze
NUXT_MONGO_URI=mongodb://localhost:27017/plaza

# JWT (min 32 znaků)
NUXT_JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# URL webu
NUXT_PUBLIC_SITE_URL=https://ocplazaliberec.cz
```

### Coolify deployment

1. Připojit Git repozitář
2. Nastavit proměnné v **Variables**
3. Deploy

## 📝 API Architektura

### Endpoints Registry Pattern

Všechny API endpointy jsou definovány v `shared/api/endpoints.ts` - Single Source of Truth:

```typescript
export const shopsEndpoints = {
	list: { method: 'GET', path: '/api/shops' },
	create: { method: 'POST', path: '/api/shops', auth: true },
	// ...
}
```

### Použití na frontendu

```typescript
// ✅ Správně - přes apiClient
const shops = await apiClient.shops.list({ page: 1 })

// ❌ Špatně - přímý $fetch
const shops = await $fetch('/api/shops')
```

### Vitest kontrola

Test `tests/endpoints-registry.test.ts` ověřuje konzistenci:

- Každý registrovaný endpoint má implementaci
- Každá implementace je registrována

## 🌍 Lokalizace (i18n)

Překlady jsou v `i18n/locales/`:

```typescript
// Použití v komponentách
const { t } = useI18n()
<p>{{ t('home.hero.title') }}</p>

// Přepnutí jazyka
const { t } = useI18n()
```

### Dostupné jazyky

- `cs` - Čeština (výchozí)

## 📋 FormKit

FormKit je nakonfigurován s českými překlady a Tailwind styly:

```vue
<FormKit type="text" name="name" :label="t('forms.name')" validation="required|length:2,100" />
```

## 🔒 Autentizace

- JWT tokeny v httpOnly cookies
- Role: `admin`, `editor`
- CMS sekce vyžaduje přihlášení

### Vytvoření admin účtu

```bash
npx tsx scripts/seed-admin.ts
```

Vytvoří admin účet `admin@ocplaza.cz` s heslem `Plaza2026!` (změnit po prvním přihlášení).

## 🐳 Docker

```bash
# Build image
docker build -t oc-plaza .

# Spuštění
docker run -p 3000:3000 \
  -e NUXT_MONGO_URI=mongodb://... \
  -e NUXT_JWT_SECRET=... \
  -e NUXT_PUBLIC_SITE_URL=https://ocplazaliberec.cz \
  oc-plaza
```

## � Produkční deployment

### Infrastruktura

| Služba       | Provider           | Účel              |
| ------------ | ------------------ | ----------------- |
| **Server**   | Hetzner Cloud      | VPS s Coolify     |
| **Databáze** | MongoDB Atlas      | Managed MongoDB   |
| **Deploy**   | Coolify + Nixpacks | Auto-deploy z Git |

### Přístupové údaje

```bash
# SSH na server
ssh coolify-vps

# Alias v ~/.ssh/config:
# Host coolify-vps
#     HostName <SERVER_IP>
#     User root
```

### Adresářová struktura na serveru

```
/data/
├── plaza/
│   ├── uploads/        ← CMS nahrané obrázky (persistent)
│   ├── mongo-backup/   ← MongoDB zálohy
│   └── backup.sh       ← Backup skript
└── coolify/            ← Coolify konfigurace
```

### Coolify konfigurace

- **Build Pack**: Nixpacks
- **Node verze**: `NIXPACKS_NODE_VERSION=22`
- **Environment Variables**:
    - `NUXT_MONGO_URI` - MongoDB Atlas connection string
    - `NUXT_JWT_SECRET` - JWT secret (min 32 znaků)
    - `NUXT_PUBLIC_SITE_URL` - URL webu
    - `NODE_ENV=production`

### Persistent Storage (uploads)

V Coolify → Configuration → Persistent Storage → Directories:

| Source Path           | Destination Path              |
| --------------------- | ----------------------------- |
| `/data/plaza/uploads` | `/app/.output/public/uploads` |

Obrázky nahrané přes CMS přežijí redeploy.

---

## 💾 Zálohování

### Co se zálohuje automaticky

| Položka     | Kde je uloženo               | Jak se zálohuje                       |
| ----------- | ---------------------------- | ------------------------------------- |
| **Kód**     | GitHub                       | Automaticky při git push              |
| **Uploads** | Server `/data/plaza/uploads` | Hetzner backup (každý den ~22:19 UTC) |
| **Server**  | Hetzner                      | Hetzner backup (7 rotujících záloh)   |

### MongoDB záloha (lokální — před velkými změnami)

Skript `scripts/backup-db.ts` se připojí k MongoDB a uloží všechny kolekce jako JSON do `mongo-backup/<datum>/`.

```bash
# Záloha produkční DB (URI z .env)
npm run backup:db

# Nebo s explicitním URI (přepíše .env)
NUXT_MONGO_URI="mongodb+srv://..." npm run backup:db
```

Výsledek: složka `mongo-backup/YYYY-MM-DD_HH-MM-SS/` s jedním `.json` souborem na kolekci + `_meta.json`.
Složku pak commitni do Gitu — záloha cestuje s kódem.

> ⚠️ `sessions.json` je součástí zálohy, ale neobsahuje hesla (jen JWT tokeny s omezenou platností).

### MongoDB záloha na serveru (ruční)

Před velkými změnami v databázi spusť:

```bash
ssh coolify-vps "/data/plaza/backup.sh"
```

Tím se vytvoří dump MongoDB do `/data/plaza/mongo-backup/`, který bude součástí následujícího Hetzner backupu.

### Obnova ze zálohy

#### A) Obnova celého serveru (disaster recovery)

1. V Hetzner Console vyber zálohu → **Restore**
2. Server se obnoví včetně uploads + MongoDB dump
3. Spusť **Redeploy** v Coolify (stáhne aktuální kód z Gitu)

#### B) Obnova pouze MongoDB z lokální zálohy (rollback obsahu)

```bash
# Obnov zálohu do cílové DB (URI nastav dle potřeby)
NUXT_MONGO_URI="mongodb+srv://..." npm run restore:db -- mongo-backup/2026-04-10_18-22-21
```

Skript smaže obsah každé kolekce a naplní ji daty ze zálohy. Prázdné kolekce přeskočí.

Alternativně přes MongoDB Compass:

- Připoj se k cílové DB
- V kolekci klikni **Add Data → Import JSON**
- Vyber soubor z `mongo-backup/<datum>/<kolekce>.json`

#### C) Obnova na serveru

```bash
ssh coolify-vps "mongorestore --uri='<MONGO_URI>' --gzip /data/plaza/mongo-backup/<DATUM>/"
```

### Čištění starých MongoDB záloh

```bash
ssh coolify-vps "find /data/plaza/mongo-backup -type d -mtime +30 -exec rm -rf {} +"
```

---

## 📊 Implementované moduly

| Modul        | Endpointy | Stav |
| ------------ | --------- | ---- |
| Auth         | 8         | ✅   |
| Shops        | 5         | ✅   |
| Categories   | 6         | ✅   |
| Events       | 8         | ✅   |
| News         | 6         | ✅   |
| Services     | 6         | ✅   |
| Floors       | 6         | ✅   |
| Users        | 5         | ✅   |
| Homepage     | 2         | ✅   |
| General Info | 2         | ✅   |
| Map          | 1         | ✅   |
| Upload       | 2         | ✅   |
| Health       | 1         | ✅   |

**Celkem: 58 API endpointů**

## 🧑‍💻 Vývojářské konvence

### Kód

- TypeScript všude
- Zod validace pro všechny vstupy
- Centralizovaný error handling
- Slug generování s českým unidecode

### Git

- `feat:` Nová funkcionalita
- `fix:` Oprava chyby
- `docs:` Dokumentace
- `refactor:` Refaktoring

### Branches

- `main` - produkce
- `develop` - vývoj
- `feature/*` - nové funkce
- `fix/*` - opravy

## 📄 Licence

Proprietární - všechna práva vyhrazena.

---

**OC Plaza Liberec** © 2026
