# Architektura projektu

OC Plaza Liberec je Nuxt 4 webova prezentace obchodniho centra s integrovanym CMS pro spravu obsahu.

---

## Technologicky stack

| Vrstva | Technologie | Verze |
|---|---|---|
| Framework | Nuxt | ^4.3.0 |
| Frontend | Vue | ^3.5.27 |
| Backend runtime | Node.js | >=22.12.0 |
| Server | Nitro `node-server` |
| Databaze | MongoDB + Mongoose | ^9.1.5 |
| Validace | Zod | ^4.3.6 |
| Autentizace | JWT + bcryptjs | ^9.0.3 / ^3.0.3 |
| Styling | Tailwind CSS | ^6.14.0 |
| Formulare | FormKit | ^1.7.2 |
| WYSIWYG | Tiptap | ^3.20.0 |
| i18n | @nuxtjs/i18n | ^10.2.1 |
| Sitemap | @nuxtjs/sitemap | ^8.0.8 |
| Mapa | @panzoom/panzoom | ^4.6.1 |
| Drag & drop | vuedraggable | ^4.1.0 |
| XSS ochrana | DOMPurify | ^3.3.3 |
| PDF export | jsPDF | ^4.2.1 |
| Testy | Vitest | ^3.2.4 |

---

## Hlavni vrstvy

```
Browser
  -> Nuxt app (SSR + client hydration)
  -> Nitro API routes
  -> Mongoose models
  -> MongoDB
```

Verejny web je SSR/CSR. CMS je Nuxt route sekce pod `/cms/*`, chranena middlewarem a serverovymi role helpery.

---

## Struktura projektu

```text
plaza/
├── app/
│   ├── app.vue
│   ├── error.vue
│   ├── assets/css/
│   ├── components/
│   │   ├── cms/
│   │   ├── homepage/
│   │   ├── layout/
│   │   ├── map/
│   │   ├── o-nas/
│   │   ├── shop/
│   │   └── ui/
│   ├── composables/
│   ├── layouts/
│   │   ├── cms.vue
│   │   └── default.vue
│   ├── middleware/
│   │   └── cms.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── o-nas.vue
│   │   ├── cookies.vue
│   │   ├── obchody/
│   │   ├── akce/
│   │   ├── mapa/
│   │   └── cms/
│   └── plugins/
│       ├── gtm.ts
│       └── silktide-cookie-manager.client.ts
├── server/
│   ├── api/
│   ├── models/
│   ├── plugins/
│   ├── routes/
│   └── utils/
├── shared/
│   ├── api/endpoints.ts
│   ├── map/
│   ├── schemas/index.ts
│   ├── types/index.ts
│   └── utils/pragueTime.ts
├── lib/apiClient.ts
├── plugins/loading-indicator.client.ts
├── i18n/locales/cs.ts
├── scripts/
├── tests/
├── nuxt.config.ts
├── Dockerfile
└── nixpacks.toml
```

Poznamka ke `scripts/`: Gitem je verzovany `scripts/health-check.mjs`. Provozni TS scripty pro zalohy, restore, sync a cleanup v aktualnim pracovnim adresari existuji, ale `scripts/*.ts` je v `.gitignore`, takze nejsou soucasti cisteho klonu repozitare.

---

## Verejne routy

| URL | Soubor | Popis |
|---|---|---|
| `/` | `app/pages/index.vue` | hlavni stranka |
| `/obchody` | `app/pages/obchody/index.vue` | vypis obchodů |
| `/obchody/:slug` | `app/pages/obchody/[slug].vue` | detail obchodu |
| `/akce` | `app/pages/akce/index.vue` | vypis akci a novinek |
| `/mapa` | `app/pages/mapa/index.vue` | interaktivni mapa |
| `/o-nas` | `app/pages/o-nas.vue` | informace o centru |
| `/cookies` | `app/pages/cookies.vue` | zasady cookies |

Verejne stranky maji SSR zapnuté v `routeRules`.

---

## CMS routy

| URL | Popis |
|---|---|
| `/cms/login` | prihlaseni |
| `/cms` | dashboard |
| `/cms/obchody` | seznam obchodů |
| `/cms/obchody/novy` | novy obchod |
| `/cms/obchody/:id` | editace obchodu |
| `/cms/akce` | seznam akci |
| `/cms/akce/nova` | nova akce |
| `/cms/akce/:id` | editace akce |
| `/cms/novinky` | seznam novinek |
| `/cms/novinky/nova` | nova novinka |
| `/cms/novinky/:id` | editace novinky |
| `/cms/sluzby` | seznam sluzeb |
| `/cms/sluzby/nova` | nova sluzba |
| `/cms/sluzby/:id` | editace sluzby |
| `/cms/kategorie` | sprava kategorii |
| `/cms/patra` | sprava pater |
| `/cms/mapa` | sprava mapy |
| `/cms/kontakty` | kontakty a oteviraci doby |
| `/cms/o-nas` | obsah O nas |
| `/cms/parkovani` | obsah parkovani |
| `/cms/hlavni-stranka` | nastaveni homepage |
| `/cms/spravci` | sprava uzivatelu |
| `/cms/spravci/novy` | novy spravce |
| `/cms/spravci/:id` | editace spravce |
| `/cms/ucet` | vlastni ucet |

CMS routy maji `X-Robots-Tag` noindex hlavicky.

---

## API architektura

API je file-based v `server/api/`.

Hlavni skupiny:

| Skupina | Ucel |
|---|---|
| `auth` | login, logout, refresh, me, sessions, change password |
| `users` | sprava CMS uzivatelu |
| `shops` | obchody |
| `categories` | kategorie obchodů |
| `floors` | patra a SVG mapy |
| `map` | verejna data pro interaktivni mapu |
| `events` | akce |
| `news` | novinky |
| `services` | sluzby |
| `general-info` | singleton obecnych informaci |
| `homepage` | singleton homepage nastaveni |
| `upload` | nahravani souboru |
| `uploads` | servirovani nahranych souboru |
| `__sitemap__` | dynamicke URL pro sitemap |

API odpovedi maji jednotny error model ze `server/utils/errors.ts`.

---

## Databazove modely

Mongoose modely:

| Model | Kolekce | Ucel |
|---|---|---|
| `User` | `users` | CMS uzivatele |
| `Session` | `sessions` | refresh token sessions |
| `RateLimit` | `ratelimits` | login rate limit |
| `Shop` | `shops` | obchody a jednotky |
| `Category` | `categories` | kategorie obchodů |
| `Floor` | `floors` | patra, SVG mapa, privatni jednotky |
| `Event` | `events` | akce |
| `News` | `news` | novinky |
| `Service` | `services` | sluzby |
| `GeneralInfo` | `generalinfos` | kontakt, oteviraci doby, O nas, parkovani |
| `Homepage` | `homepages` | homepage singleton |

`server/utils/db.ts` importuje modely centralne, aby byly registrovane pri prvnim pripojeni.

---

## Sdileny kod

Slozka `shared/` obsahuje kod pouzitelny na serveru i klientovi.

| Soubor | Ucel |
|---|---|
| `shared/api/endpoints.ts` | registry API endpointu |
| `shared/schemas/index.ts` | Zod schemata |
| `shared/types/index.ts` | TypeScript typy |
| `shared/map/units.ts` | typy a helpery mapy |
| `shared/map/normalizeSvg.ts` | normalizace SVG mapy |
| `shared/utils/pragueTime.ts` | prace s prazskym casem |

---

## Auth tok

```text
/cms/login
  -> POST /api/auth/login
  -> User + bcrypt check
  -> Session document
  -> access_token + refresh_token + csrf_token cookies
  -> /cms middleware overuje /api/auth/me
```

Access token a refresh token maji realne 7 dni. Refresh token se rotuje pri `/api/auth/refresh`.

Role se kontroluji serverove, ne jen v UI.

---

## Mapa

Mapa kombinuje:

- `Floor.svgContent`,
- `Floor.staticAroundMapContent`,
- `Floor.privateOccupiedUnitCodes`,
- `Shop.floorIds`,
- `Shop.unitCodes`,
- legacy `Shop.floorId` a `Shop.unitCode`.

`GET /api/map/units` vraci vsechna aktivni patra vcetne jednotek. Pokud je predan `floorId`, vraci data jednoho patra.

Stavy jednotek:

- obsazena obchodem,
- privatne obsazena bez verejneho detailu,
- volna.

Export mapy do SVG/PDF resi `useMapExport.ts`.

---

## Obsahove singletony

`GeneralInfo` je hlavni singleton pro:

- kontaktni udaje,
- socialni site,
- oteviraci doby,
- specialni oteviraci doby,
- texty O nas,
- parkovani.

`Homepage` je singleton pro homepage:

- hero sekce,
- navigacni highlighty,
- promo a nastaveni zobrazeni vybranych obsahovych bloku.

---

## i18n

Projekt je pripraveny na vice jazyku, ale realne je aktivni jen cestina.

Konfigurace:

- `defaultLocale: 'cs'`,
- strategie `prefix_except_default`,
- locale soubor `i18n/locales/cs.ts`,
- anglicky locale je v `nuxt.config.ts` pouze zakomentovany.

---

## SEO

SEO resi:

- globalni meta tagy v `nuxt.config.ts`,
- `usePlazaSeo()` na strankach,
- schema.org JSON-LD pres `useJsonLd()`,
- sitemap pres `@nuxtjs/sitemap`,
- dynamicke obchodni URL pres `/api/__sitemap__/urls`.

`/cookies` je vyloucene ze sitemap, ale verejne existuje.

---

## Analytics a cookies

GTM plugin:

- `app/plugins/gtm.ts`,
- preskakuje CMS,
- default Consent Mode v2 je `denied`,
- GTM ID je `NUXT_PUBLIC_GTM_ID` nebo fallback `GTM-WB3N3SCX`.

Cookie manager:

- `app/plugins/silktide-cookie-manager.client.ts`,
- lokalni Silktide assety,
- preskakuje CMS,
- kategorie `nezbytn`, `analytick`, `reklamn_a_personaliza_n`.

Hotjar neni v kodu vlozeny primo.

---

## Deployment architektura

Repo podporuje:

- Node server pres `.output/server/index.mjs`,
- Docker multi-stage image,
- Nixpacks install konfiguraci.

Kriticke provozni zavislosti:

- MongoDB,
- perzistentni upload volume,
- DNS/SSL,
- ENV promenne,
- zalohy DB a uploadu.
