# Architektura projektu

OC Plaza Liberec – webová prezentace obchodního centra s integrovaným CMS pro správu obsahu.

---

## Technologický stack

| Vrstva | Technologie | Verze |
|---|---|---|
| Framework | Nuxt 4 (compatibility v4) | ^4.3.0 |
| Frontend runtime | Vue 3 | ^3.5.27 |
| Backend runtime | Node.js | >=22.12.0 |
| Databáze | MongoDB + Mongoose | ^9.1.5 |
| Validace | Zod | ^4.3.6 |
| Autentizace | JWT + bcryptjs | ^9.0.3 / ^3.0.3 |
| Styling | Tailwind CSS | ^6.14.0 |
| Formuláře | FormKit | ^1.7.2 |
| WYSIWYG editor | Tiptap | ^3.20.0 |
| i18n | @nuxtjs/i18n | ^10.2.1 |
| Sitemap | @nuxtjs/sitemap | ^8.0.8 |
| Mapy | @panzoom/panzoom | ^4.6.1 |
| Drag & drop | vuedraggable | ^4.1.0 |
| XSS ochrana | DOMPurify | ^3.3.3 |
| Testování | Vitest | ^3.2.4 |

---

## Struktura projektu

```
plaza/
├── app/                        # Frontend (Nuxt 4 app dir)
│   ├── app.vue                 # Root komponenta
│   ├── error.vue               # Error stránka
│   ├── assets/css/             # Globální CSS (Tailwind)
│   ├── components/             # Vue komponenty
│   │   ├── cms/                # CMS-specifické komponenty
│   │   ├── homepage/           # Komponenty hlavní stránky
│   │   ├── layout/             # Layout komponenty (header, footer...)
│   │   ├── map/                # Interaktivní mapa
│   │   ├── o-nas/              # Komponenty stránky O nás
│   │   ├── shop/               # Komponenty obchodů
│   │   └── ui/                 # Obecné UI komponenty
│   ├── composables/            # Vue composables
│   ├── layouts/
│   │   ├── cms.vue             # Layout pro CMS sekci
│   │   └── default.vue         # Layout pro veřejnou část
│   ├── middleware/
│   │   └── cms.ts              # Route middleware pro CMS přístup
│   └── pages/                  # Stránky (file-based routing)
│       ├── index.vue           # Hlavní stránka
│       ├── o-nas.vue           # O nás
│       ├── cookies.vue         # Cookies policy
│       ├── obchody/            # Výpis a detail obchodů
│       ├── akce/               # Výpis akcí
│       ├── mapa/               # Interaktivní mapa
│       └── cms/                # CMS rozhraní (chráněno middleware)
│
├── server/                     # Backend (Nitro server)
│   ├── api/                    # API endpointy (file-based routing)
│   │   ├── auth/               # Přihlášení, session, tokeny
│   │   ├── shops/              # CRUD obchodů
│   │   ├── events/             # CRUD akcí
│   │   ├── news/               # CRUD novinek
│   │   ├── services/           # CRUD služeb
│   │   ├── categories/         # CRUD kategorií
│   │   ├── floors/             # CRUD pater
│   │   ├── general-info/       # Singleton – info o centru
│   │   ├── homepage/           # Singleton – nastavení hlavní stránky
│   │   ├── map/                # Mapa – jednotky pater
│   │   ├── upload/             # Nahrávání souborů
│   │   ├── uploads/            # Servírování souborů
│   │   ├── users/              # CRUD CMS uživatelů
│   │   └── __sitemap__/        # Dynamická sitemap data
│   ├── models/                 # Mongoose modely
│   ├── plugins/                # Nitro pluginy
│   ├── routes/                 # Vlastní Nitro routes (robots.txt, uploads)
│   └── utils/                  # Sdílené server utility
│       ├── auth.ts             # JWT, cookies, oprávnění
│       ├── csrf.ts             # CSRF ochrana
│       ├── db.ts               # MongoDB připojení + connection pooling
│       ├── errors.ts           # Jednotný error model
│       ├── format.ts           # Formátovací utility
│       ├── rateLimit.ts        # In-memory rate limiter
│       └── slug.ts             # Slug generátor
│
├── shared/                     # Sdílený kód (server i klient)
│   ├── api/
│   │   └── endpoints.ts        # Registr API endpointů (single source of truth)
│   ├── map/
│   │   └── units.ts            # Typy a utility pro mapu
│   ├── schemas/
│   │   └── index.ts            # Zod validační schémata
│   └── types/
│       └── index.ts            # Sdílené TypeScript typy
│
├── lib/
│   └── apiClient.ts            # Centrální API klient pro frontend
│
├── plugins/
│   └── loading-indicator.client.ts  # Globální loading indicator
│
├── app/plugins/
│   ├── gtm.ts                  # Google Tag Manager
│   └── silktide-cookie-manager.client.ts  # Cookie consent
│
├── i18n/locales/cs.ts          # České překlady
├── scripts/                    # Provozní scripty (backup DB, cleanup)
├── tests/                      # Testy (Vitest)
├── nuxt.config.ts              # Konfigurace Nuxt
├── tailwind.config.ts          # Konfigurace Tailwind
├── formkit.config.ts           # Konfigurace FormKit
├── Dockerfile                  # Multi-stage Docker build
└── nixpacks.toml               # Konfigurace pro Railway/Nixpacks
```

---

## Architekturní diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Uživatelé                                │
│               Návštěvníci OC     CMS Správci                   │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │                      │
                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nuxt 4 App                                 │
│  ┌─────────────────────────┐   ┌──────────────────────────────┐ │
│  │    Veřejná část         │   │       CMS sekce              │ │
│  │  /  /obchody  /akce     │   │   /cms/* (chráněno JWT)      │ │
│  │  /mapa  /o-nas          │   │   Middleware: cms.ts         │ │
│  │                         │   │                              │ │
│  │  SSR + CSR hydration    │   │   CSR (client-only rendering)│ │
│  └─────────────────────────┘   └──────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Nitro Server (API vrstva)                      │ │
│  │                                                             │ │
│  │  server/utils/auth.ts       server/utils/csrf.ts           │ │
│  │  server/utils/rateLimit.ts  server/utils/errors.ts         │ │
│  │                                                             │ │
│  │  /api/auth/*    /api/shops/*    /api/events/*              │ │
│  │  /api/services/* /api/news/*   /api/floors/*               │ │
│  │  /api/categories/* /api/users/* /api/map/*                 │ │
│  │  /api/upload    /api/uploads/* /api/general-info           │ │
│  │  /api/homepage  /api/__sitemap__/urls                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
              ┌────────────────────────────────────┐
              │            MongoDB                  │
              │  Collections:                       │
              │  users, sessions, shops, events,    │
              │  news, services, categories,        │
              │  floors, generalinfos, homepages    │
              └────────────────────────────────────┘
```

---

## Routování

### Veřejná část (SSR + CSR)

| URL | Soubor | Popis |
|---|---|---|
| `/` | `pages/index.vue` | Hlavní stránka |
| `/obchody` | `pages/obchody/index.vue` | Výpis obchodů s filtry |
| `/obchody/:slug` | `pages/obchody/[slug].vue` | Detail obchodu |
| `/akce` | `pages/akce/index.vue` | Výpis akcí |
| `/mapa` | `pages/mapa/index.vue` | Interaktivní mapa |
| `/o-nas` | `pages/o-nas.vue` | O nás |
| `/cookies` | `pages/cookies.vue` | Zásady cookies |

### CMS sekce (chráněno `middleware/cms.ts`)

| URL | Soubor | Popis |
|---|---|---|
| `/cms/login` | `pages/cms/login.vue` | Přihlašovací stránka |
| `/cms` | `pages/cms/index.vue` | Dashboard |
| `/cms/obchody` | `pages/cms/obchody/index.vue` | Seznam obchodů |
| `/cms/obchody/novy` | `pages/cms/obchody/novy.vue` | Nový obchod |
| `/cms/obchody/:id` | `pages/cms/obchody/[id].vue` | Editace obchodu |
| `/cms/akce` | `pages/cms/akce/index.vue` | Seznam akcí |
| `/cms/akce/nova` | `pages/cms/akce/nova.vue` | Nová akce |
| `/cms/akce/:id` | `pages/cms/akce/[id].vue` | Editace akce |
| `/cms/sluzby` | `pages/cms/sluzby/index.vue` | Seznam služeb |
| `/cms/sluzby/nova` | `pages/cms/sluzby/nova.vue` | Nová služba |
| `/cms/sluzby/:id` | `pages/cms/sluzby/[id].vue` | Editace služby |
| `/cms/novinky` | `pages/cms/novinky/index.vue` | Seznam novinek |
| `/cms/novinky/nova` | `pages/cms/novinky/nova.vue` | Nová novinka |
| `/cms/novinky/:id` | `pages/cms/novinky/[id].vue` | Editace novinky |
| `/cms/kategorie` | `pages/cms/kategorie/index.vue` | Správa kategorií |
| `/cms/patra` | `pages/cms/patra/index.vue` | Správa pater |
| `/cms/mapa` | `pages/cms/mapa/index.vue` | Správa mapy |
| `/cms/kontakty` | `pages/cms/kontakty.vue` | Kontakty a otevírací doby |
| `/cms/o-nas` | `pages/cms/o-nas.vue` | Obsah O nás |
| `/cms/parkovani` | `pages/cms/parkovani.vue` | Obsah parkování |
| `/cms/hlavni-stranka` | `pages/cms/hlavni-stranka.vue` | Nastavení hlavní stránky |
| `/cms/spravci` | `pages/cms/spravci/index.vue` | Seznam správců (admin only) |
| `/cms/spravci/novy` | `pages/cms/spravci/novy.vue` | Nový správce (admin only) |
| `/cms/spravci/:id` | `pages/cms/spravci/[id].vue` | Editace správce (admin only) |
| `/cms/ucet` | `pages/cms/ucet.vue` | Správa vlastního účtu |

---

## Sdílený kód (shared/)

Složka `shared/` obsahuje kód dostupný na serveru i klientovi:

- **`shared/api/endpoints.ts`** – registr všech API endpointů. Frontend nikdy nepíše URL stringy ručně.
- **`shared/schemas/index.ts`** – Zod validační schémata sdílená mezi serverem (validace requestů) a frontendem (validace formulářů).
- **`shared/types/index.ts`** – TypeScript typy entit (Shop, Event, User, ...).
- **`shared/map/units.ts`** – typy a utility pro interaktivní mapu.

---

## i18n

Projekt je připraven pro vícejazyčnost, aktuálně aktivní pouze čeština.

- Strategie: `prefix_except_default` (čeština bez prefixu, ostatní s `/en/...`)
- Detekce jazyka: cookie `plaza_locale`, redirect pouze na root
- Překlady: `i18n/locales/cs.ts`
- Anglický locale existuje v konfiguraci, ale je zakomentovaný

---

## Nitro preset

Projekt je nastaven na `preset: 'node-server'`. Build vytvoří `.output/` se samostatným Node.js serverem spustitelným příkazem:

```bash
node .output/server/index.mjs
```

---

## Technický dluh / rizika

- `floorId` a `unitCode` na modelu Shop jsou označeny `@deprecated`. Přechod na `floorIds` / `unitCodes` proběhl, ale legacy pole zůstávají kvůli zpětné kompatibilitě.
- `lib/apiClient.ts` odkazuje na typy `Page`, `Banner`, `PageCreateInput`, `BannerUpdateInput` atd., které neexistují v `shared/types/index.ts` ani `shared/schemas/index.ts` – mrtvé typy z nevyužitých endpoint definicí.
- Rate limiter je in-memory – při horizontálním škálování (více instancí) nebude sdílet stav.
