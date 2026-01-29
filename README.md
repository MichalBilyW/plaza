# 🏢 OC Plaza Liberec

Webová prezentace a CMS pro nákupní centrum OC Plaza Liberec.

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Tech Stack

| Kategorie | Technologie | Účel |
|-----------|-------------|------|
| **Framework** | [Nuxt 4](https://nuxt.com) | Full-stack SSR framework |
| **Runtime** | Node.js 22 | JavaScript runtime |
| **Databáze** | [MongoDB](https://mongodb.com) + [Mongoose](https://mongoosejs.com) | Document database s ODM |
| **Styling** | [TailwindCSS](https://tailwindcss.com) | Utility-first CSS |
| **Formuláře** | [FormKit](https://formkit.com) | Vue form framework |
| **Lokalizace** | [@nuxtjs/i18n](https://i18n.nuxtjs.org) | Internacionalizace (cs/en) |
| **Validace** | [Zod](https://zod.dev) | Schema validace |
| **Auth** | JWT + bcrypt | Autentizace s httpOnly cookies |
| **Testy** | [Vitest](https://vitest.dev) | Unit testy |
| **Linting** | ESLint + Prettier | Code quality |
| **Deploy** | Docker / [Coolify](https://coolify.io) | Kontejnerizace a hosting |

## 📁 Struktura projektu

```
plaza/
├── app/                    # Nuxt app entry
├── composables/            # Vue composables
│   ├── useCmsAuth.ts       # CMS autentizace
│   └── usePlazaSeo.ts      # SEO helper
├── i18n/                   # Lokalizace
│   └── locales/
│       ├── cs.ts           # České překlady
│       └── en.ts           # Anglické překlady
├── layouts/                # Nuxt layouts
│   ├── default.vue         # Veřejný web
│   └── cms.vue             # CMS administrace
├── lib/                    # Pomocné knihovny
│   └── apiClient.ts        # Centralizovaný API klient
├── middleware/             # Route middleware
│   └── cms.ts              # CMS auth guard
├── pages/                  # Nuxt stránky
│   ├── cms/                # CMS sekce
│   └── ...                 # Veřejné stránky
├── server/                 # Nitro server
│   ├── api/                # API endpointy
│   ├── models/             # Mongoose modely
│   └── utils/              # Server utilities
├── shared/                 # Sdílené mezi client/server
│   ├── api/endpoints.ts    # Endpoints registry (SSOT)
│   ├── schemas/            # Zod schémata
│   └── types/              # TypeScript typy
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

| Prefix | Typ | Přístup |
|--------|-----|---------|
| `NUXT_` | Private | Pouze server |
| `NUXT_PUBLIC_` | Public | Client + server |

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
const { setLocale } = useI18n()
setLocale('en')
```

### Dostupné jazyky

- `cs` - Čeština (výchozí)
- `en` - English

## 📋 FormKit

FormKit je nakonfigurován s českými/anglickými překlady a Tailwind styly:

```vue
<FormKit
  type="text"
  name="name"
  :label="t('forms.name')"
  validation="required|length:2,100"
/>
```

## 🔒 Autentizace

- JWT tokeny v httpOnly cookies
- Role: `admin`, `editor`
- CMS sekce vyžaduje přihlášení

### Vytvoření admin účtu

```bash
# TODO: Přidat seed script
npm run db:seed
```

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

## 📊 Implementované moduly

| Modul | Endpointy | Stav |
|-------|-----------|------|
| Auth | 3 | ✅ |
| Shops | 5 | ✅ |
| Events | 7 | ✅ |
| Categories | 2 | ✅ |
| Health | 1 | ✅ |

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
