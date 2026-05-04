# Datové modely

Databáze používá MongoDB přes Mongoose. Modely jsou v `server/models/` a sdílené TypeScript/Zod typy jsou ve `shared/types/index.ts` a `shared/schemas/index.ts`.

Připojení k databázi zajišťuje `server/utils/db.ts`. Modely se registrují přes `mongoose.models.ModelName || mongoose.model(...)`, aby nevznikaly problémy při hot reloadu.

---

## Přehled kolekcí

| Model | Kolekce | Účel |
|---|---|---|
| `User` | `users` | CMS uživatelé |
| `Session` | `sessions` | Přihlášení a refresh tokeny |
| `RateLimit` | `ratelimits` | Perzistentní rate limiting |
| `Shop` | `shops` | Obchody/nájemci |
| `Category` | `categories` | Kategorie obchodů |
| `Floor` | `floors` | Patra a SVG mapové podklady |
| `Event` | `events` | Akce navázané na obchod |
| `News` | `news` | Novinky centra |
| `Service` | `services` | Služby centra |
| `GeneralInfo` | `generalinfos` | Singleton obecných informací |
| `Homepage` | `homepages` | Singleton nastavení homepage |

---

## User

Soubor: `server/models/User.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `email` | String | required, unique, lowercase, trim, index |
| `password` | String | required, `select: false`, bcrypt hash |
| `name` | String | required, trim |
| `role` | String | `superadmin`, `admin`, `editor`, default `editor` |
| `isActive` | Boolean | default `true` |
| `lastLoginAt` | Date | nastavuje se při loginu |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `email`
- `{ role: 1, isActive: 1 }`

`toJSON` odstraňuje `password` a `__v`.

---

## Session

Soubor: `server/models/Session.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `userId` | ObjectId ref `User` | vlastník session |
| `refreshToken` | String | unique, rotovaný token |
| `userAgent` | String/null | informace o prohlížeči |
| `ipAddress` | String/null | IP adresa |
| `isValid` | Boolean | `false` znamená odhlášeno/zneplatněno |
| `expiresAt` | Date | expirace session |
| `lastActivityAt` | Date | poslední aktivita |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `userId`
- `refreshToken` unique
- `isValid`
- `{ userId: 1, isValid: 1 }`
- TTL index `{ expiresAt: 1 }` s `expireAfterSeconds: 0`

MongoDB automaticky maže expirované session dokumenty.

---

## RateLimit

Soubor: `server/models/RateLimit.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `key` | String | unique, například `login:<ip>` |
| `count` | Number | počet pokusů v okně |
| `resetAt` | Date | konec časového okna |
| `blockedUntil` | Date/null | konec blokace |
| `expiresAt` | Date | TTL mazání |

Indexy:

- `key` unique
- TTL index `{ expiresAt: 1 }` s `expireAfterSeconds: 0`

Používá se na login endpointu.

---

## Shop

Soubor: `server/models/Shop.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `name` | String | required, trim, max 100 |
| `slug` | String | required, unique, lowercase, trim, index |
| `description` | String | HTML popis, Mongoose max 5000 |
| `shortDescription` | String | max 300 |
| `logo` | String | URL uploadu |
| `gallery` | String[] | URL uploadů |
| `phone` | String | telefon |
| `email` | String | lowercase |
| `website` | String | URL |
| `socialLinks.facebook` | String | URL |
| `socialLinks.instagram` | String | URL |
| `floorId` | ObjectId ref `Floor` | legacy/deprecated |
| `floorIds` | ObjectId[] ref `Floor` | preferované vícepodlažní umístění |
| `categoryIds` | ObjectId[] ref `Category` | kategorie |
| `unitCode` | String | legacy/deprecated |
| `unitCodes` | String[] | preferované mapové jednotky |
| `mapPosition` | Object | legacy pozice |
| `mapPolygon` | String | legacy SVG polygon |
| `openingHours` | OpeningHoursEntry[] | běžná otevírací doba |
| `specialOpeningHours` | SpecialOpeningHours[] | výjimky |
| `isActive` | Boolean | default `true` |
| `publishDate` | Date/null | datum připravovaného otevření |
| `seoTitle` | String | max 60 |
| `seoDescription` | String | max 160 |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `slug` unique
- text index `{ name: 'text', description: 'text' }`
- `{ floorId: 1, isActive: 1 }`
- `{ floorIds: 1, isActive: 1 }`
- `{ categoryIds: 1, isActive: 1 }`
- `{ unitCodes: 1 }`
- přímé indexy na `floorId`, `unitCode`, `isActive`, `publishDate`

Poznámky:

- `floorIds` a `unitCodes` jsou aktuální formát.
- `floorId` a `unitCode` se stále vyplňují kvůli zpětné kompatibilitě.
- `publishDate` nefunguje jako tvrdé skrytí detailu. Veřejné karty a mapa ho používají pro stav "Otevíráme".
- Zod schema aktuálně povoluje `description` max 50000 znaků, ale Mongoose model má max 5000. Reálný limit při uložení je tedy potřeba brát jako 5000, dokud se nesjednotí model a schema.

### OpeningHoursEntry

```ts
{
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open: string
  close: string
  closed?: boolean
}
```

Čas je ve formátu `HH:mm`.

### SpecialOpeningHours

```ts
{
  date?: Date
  dateFrom?: Date
  dateTo?: Date
  open?: string
  close?: string
  closed?: boolean
  note?: string
}
```

Použije se buď jeden den `date`, nebo interval `dateFrom` + `dateTo`.

---

## Category

Soubor: `server/models/Category.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `name` | String | required, trim, max 100 |
| `slug` | String | required, unique, lowercase, trim, index |
| `isActive` | Boolean | default `true` |
| `sortOrder` | Number | default 0 |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `slug` unique
- `{ isActive: 1, sortOrder: 1 }`
- text index `{ name: 'text' }`

API dopočítává `shopCount` podle aktivních obchodů.

---

## Floor

Soubor: `server/models/Floor.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `name` | String | required, trim, max 50 |
| `level` | Number | required, index |
| `mapImage` | String | legacy obrázek mapy |
| `svgMap` | String | URL/cesta SVG mapy patra |
| `privateOccupiedUnitCodes` | String[] | jednotky obsazené mimo veřejné obchody |
| `isActive` | Boolean | default `true` |
| `sortOrder` | Number | default 0 |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `level`
- `{ isActive: 1, sortOrder: 1 }`

`GET /api/map/units` načítá `svgMap`, extrahuje z SVG jednotky podle ID a páruje je s obchody přes `unitCodes`.

Poznámka: `shopCount` v `GET /api/floors` se aktuálně počítá přes legacy `floorId`, ne přes `floorIds`.

---

## Event

Soubor: `server/models/Event.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `name` | String | required, trim, max 200, interní název |
| `image` | String | required, URL obrázku |
| `content` | String | HTML obsah, max 50000 |
| `shopId` | ObjectId ref `Shop` | required |
| `sortOrder` | Number | default 0 |
| `isActive` | Boolean | default `true` |
| `displayUntil` | Date/null | zobrazovat na webu do tohoto data |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- text index `{ name: 'text' }`
- `{ isActive: 1, sortOrder: 1 }`
- `{ shopId: 1, isActive: 1 }`
- přímý index na `displayUntil`

Veřejný web načítá akce s `isActive=true` a `notExpired=true`.

---

## News

Soubor: `server/models/News.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `name` | String | required, trim, max 200, interní název |
| `image` | String | required |
| `content` | String | HTML obsah, default `''` |
| `sortOrder` | Number | default 0 |
| `isActive` | Boolean | default `true` |
| `displayUntil` | Date/null | zobrazovat na webu do tohoto data |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- text index `{ name: 'text' }`
- `{ isActive: 1, sortOrder: 1 }`
- přímý index na `displayUntil`

---

## Service

Soubor: `server/models/Service.ts`

| Pole | Typ | Poznámka |
|---|---|---|
| `icon` | String | required, URL ikony |
| `shortDescription` | String | required, trim, max 120 |
| `description` | String | HTML obsah, max 50000 |
| `isActive` | Boolean | default `true` |
| `sortOrder` | Number | default 0 |
| `createdAt` / `updatedAt` | Date | timestamps |

Indexy:

- `{ isActive: 1, sortOrder: 1 }`
- text index `{ shortDescription: 'text' }`

---

## GeneralInfo

Soubor: `server/models/GeneralInfo.ts`

Singleton model pro obecné informace centra.

| Pole | Typ | Poznámka |
|---|---|---|
| `title` | String | max 200 |
| `shortText` | String | max 500 |
| `text` | String | max 10000 |
| `openingHours` | OpeningHoursEntry[] | otevírací doba centra |
| `specialOpeningHours` | SpecialOpeningHours[] | výjimky |
| `facebook` | String | URL |
| `instagram` | String | URL |
| `gallery` | String[] | max 10 v Zod schématu |
| `staticAroundMap` | String | SVG okolí centra, superadmin-only update |
| `parkingContent` | String | max 1000 |
| `parkingImage` | String | URL |
| `parkingOtherInfo` | String | max 10000 |
| `contacts` | Contact[] | max 30 v Zod schématu |

Statická metoda `getOrCreate()` vrací první záznam nebo vytvoří nový s výchozí otevírací dobou 09:00-21:00 pro každý den.

### Contact

```ts
{
  title?: string
  name?: string
  phone?: string
  email?: string
}
```

---

## Homepage

Soubor: `server/models/Homepage.ts`

Singleton model pro nastavení hlavní stránky.

| Pole | Typ | Výchozí | Poznámka |
|---|---|---|---|
| `heroImage` | String | - | URL hero obrázku |
| `showHeroBorder` | Boolean | `true` | dekorativní rámeček |

Statická metoda `getOrCreate()` vrací první záznam nebo vytvoří prázdný.

---

## Vazby

```text
User 1 - N Session
Shop N - N Floor přes floorIds
Shop N - N Category přes categoryIds
Shop 1 - N unitCodes
Event N - 1 Shop
Floor 1 - N privateOccupiedUnitCodes
GeneralInfo singleton
Homepage singleton
```

---

## Známé datové nesrovnalosti

- `Shop.description`: Zod povoluje 50000 znaků, Mongoose model 5000.
- `Shop.floorId` / `Shop.unitCode`: legacy pole stále existují a některé části kódu je ještě používají pro fallback nebo výpočty.
- `Floor.shopCount`: API počítá obchody přes legacy `floorId`, ne přes `floorIds`.
- Endpointy `events/:id/publish` a `events/:id/unpublish` pracují s polem `published`, které není v aktuálním modelu `Event`; primární stav publikace je `isActive`.
