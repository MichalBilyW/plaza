# Datové modely (Mongoose)

Všechny modely jsou definovány v `server/models/`. Připojení k DB se cachuje přes `server/utils/db.ts`.

---

## User – CMS uživatelé

**Soubor:** `server/models/User.ts`
**Kolekce:** `users`

### Pole

| Pole | Typ | Povinné | Validace / Výchozí | Popis |
|---|---|---|---|---|
| `email` | String | Ano | unique, lowercase, trim, index | Přihlašovací email |
| `password` | String | Ano | `select: false` | bcrypt hash, nikdy nevrácen v dotazech |
| `name` | String | Ano | trim | Zobrazované jméno |
| `role` | String | Ano | enum: `superadmin`, `admin`, `editor`, default: `editor` | Role uživatele |
| `isActive` | Boolean | Ne | default: `true` | Deaktivovaný uživatel se nemůže přihlásit |
| `lastLoginAt` | Date | Ne | – | Nastaveno při každém přihlášení |
| `createdAt` | Date | – | auto (timestamps) | |
| `updatedAt` | Date | – | auto (timestamps) | |

### Indexy

- `email: 1` (unique, přímý index na poli)
- `role: 1, isActive: 1` (compound)

### toJSON transformace

Heslo a `__v` jsou automaticky odstraněny z JSON výstupu.

---

## Session – správa sessions

**Soubor:** `server/models/Session.ts`
**Kolekce:** `sessions`

### Pole

| Pole | Typ | Povinné | Validace / Výchozí | Popis |
|---|---|---|---|---|
| `userId` | ObjectId (ref: User) | Ano | index | Vlastník session |
| `refreshToken` | String | Ano | unique, index | Hex token 128 znaků |
| `userAgent` | String | Ne | default: null | User-Agent prohlížeče |
| `ipAddress` | String | Ne | default: null | IP adresa |
| `isValid` | Boolean | Ne | default: true, index | `false` = session odhlášena |
| `expiresAt` | Date | Ano | – | Datum expirace (now + 7 dní) |
| `lastActivityAt` | Date | Ne | default: Date.now | Poslední aktivita |
| `createdAt` | Date | – | auto (timestamps) | |
| `updatedAt` | Date | – | auto (timestamps) | |

### Indexy

- `userId: 1` (přímý index)
- `refreshToken: 1` (unique, přímý index)
- `isValid: 1` (přímý index)
- `userId: 1, isValid: 1` (compound)
- `expiresAt: 1` (TTL index, `expireAfterSeconds: 0` – MongoDB automaticky maže expirované dokumenty)

---

## Shop – obchody / nájemci

**Soubor:** `server/models/Shop.ts`
**Kolekce:** `shops`

### Pole

| Pole | Typ | Povinné | Validace / Výchozí | Popis |
|---|---|---|---|---|
| `name` | String | Ano | trim, maxlength: 100 | Název obchodu |
| `slug` | String | Ano | unique, lowercase, trim, index | URL slug |
| `description` | String | Ne | maxlength: 5000 | Dlouhý popis (HTML z WYSIWYG) |
| `shortDescription` | String | Ne | maxlength: 300 | Krátký popis |
| `logo` | String | Ne | – | URL loga (z `/api/uploads/`) |
| `gallery` | [String] | Ne | – | Pole URL obrázků |
| `phone` | String | Ne | – | Telefon |
| `email` | String | Ne | lowercase | Email |
| `website` | String | Ne | – | Web |
| `socialLinks.facebook` | String | Ne | – | URL |
| `socialLinks.instagram` | String | Ne | – | URL |
| `socialLinks.twitter` | String | Ne | – | URL |
| `floorId` | ObjectId (ref: Floor) | Ne | index | **@deprecated** Použij `floorIds` |
| `floorIds` | [ObjectId (ref: Floor)] | Ne | – | Patra obchodu (může být na více) |
| `categoryIds` | [ObjectId (ref: Category)] | Ne | – | Kategorie obchodu |
| `unitCode` | String | Ne | maxlength: 20, index | **@deprecated** Použij `unitCodes` |
| `unitCodes` | [String] | Ne | maxlength: 20 per item | Kódy jednotek na mapě |
| `mapPosition` | Object | Ne | `{ x, y, width, height }` | Pozice na mapě (legacy) |
| `mapPolygon` | String | Ne | – | SVG polygon cesta |
| `openingHours` | [OpeningHoursEntry] | Ne | – | Pravidelné otevírací doby |
| `specialOpeningHours` | [SpecialOpeningHours] | Ne | – | Výjimečné otevírací doby |
| `isActive` | Boolean | Ne | default: true, index | Publikováno |
| `publishDate` | Date | Ne | default: null, index | Datum plánovaného zveřejnění |
| `seoTitle` | String | Ne | maxlength: 60 | SEO titulek |
| `seoDescription` | String | Ne | maxlength: 160 | SEO popis |
| `createdAt` | Date | – | auto | |
| `updatedAt` | Date | – | auto | |

### Sub-schema: OpeningHoursEntry

```typescript
{
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open: string    // HH:mm, regex /^([01]\d|2[0-3]):([0-5]\d)$/
  close: string   // HH:mm, regex /^([01]\d|2[0-3]):([0-5]\d)$/
  closed?: boolean
}
```

### Sub-schema: SpecialOpeningHours

```typescript
{
  date?: Date         // Jednotlivý den (NEBO)
  dateFrom?: Date     // Začátek období
  dateTo?: Date       // Konec období
  open?: string       // HH:mm
  close?: string      // HH:mm
  closed?: boolean
  note?: string       // max 200 znaků
}
```

### Indexy

- `slug: 1` (unique)
- `floorId: 1` (přímý)
- `isActive: 1`, `publishDate: 1` (přímé)
- `name text, description text` (fulltextový)
- `floorId: 1, isActive: 1`
- `floorIds: 1, isActive: 1`
- `categoryIds: 1, isActive: 1`
- `unitCodes: 1`

### Poznámky

- `unitCodes` a `floorIds` jsou preferovaná pole. `unitCode` a `floorId` jsou zachovány pro zpětnou kompatibilitu.
- `publishDate` je uloženo, ale logika časovaného zveřejnění není implementována v API (filtrování probíhá jen podle `isActive`).

---

## Event – akce

**Soubor:** `server/models/Event.ts`
**Kolekce:** `events`

### Pole

| Pole | Typ | Povinné | Validace | Popis |
|---|---|---|---|---|
| `name` | String | Ano | trim, maxlength: 200 | Interní název (jen pro CMS) |
| `image` | String | Ano | – | URL čtvercového obrázku |
| `content` | String | Ne | maxlength: 50000 | HTML obsah (WYSIWYG) |
| `shopId` | ObjectId (ref: Shop) | Ano | index | Vázaný obchod |
| `sortOrder` | Number | Ne | default: 0 | Pořadí |
| `isActive` | Boolean | Ne | default: true, index | Publikováno |

### Indexy

- `name text` (fulltextový)
- `isActive: 1, sortOrder: 1`
- `shopId: 1, isActive: 1`

---

## News – novinky centra

**Soubor:** `server/models/News.ts`
**Kolekce:** `news`

### Pole

| Pole | Typ | Povinné | Validace | Popis |
|---|---|---|---|---|
| `name` | String | Ano | trim, maxlength: 200 | Interní název (jen pro CMS) |
| `image` | String | Ano | – | URL čtvercového obrázku |
| `content` | String | Ne | default: `''` | HTML obsah (WYSIWYG) |
| `sortOrder` | Number | Ne | default: 0 | Pořadí |
| `isActive` | Boolean | Ne | default: true, index | Publikováno |

### Indexy

- `name text`
- `isActive: 1, sortOrder: 1`

---

## Service – služby pro návštěvníky

**Soubor:** `server/models/Service.ts`
**Kolekce:** `services`

### Pole

| Pole | Typ | Povinné | Validace | Popis |
|---|---|---|---|---|
| `icon` | String | Ano | – | URL ikony (SVG nebo PNG) |
| `shortDescription` | String | Ano | trim, maxlength: 120 | Popisek (zobrazuje se na webu) |
| `description` | String | Ne | maxlength: 50000 | Detailní popis (HTML) |
| `isActive` | Boolean | Ne | default: true, index | Publikováno |
| `sortOrder` | Number | Ne | default: 0 | Pořadí |

### Indexy

- `isActive: 1, sortOrder: 1`
- `shortDescription text`

---

## Category – kategorie obchodů

**Soubor:** `server/models/Category.ts`
**Kolekce:** `categories`

### Pole

| Pole | Typ | Povinné | Validace | Popis |
|---|---|---|---|---|
| `name` | String | Ano | trim, maxlength: 100 | Název kategorie |
| `slug` | String | Ano | unique, lowercase, trim, index | URL slug |
| `isActive` | Boolean | Ne | default: true | Aktivní |
| `sortOrder` | Number | Ne | default: 0 | Pořadí |

### Indexy

- `slug: 1` (unique)
- `isActive: 1, sortOrder: 1`
- `name text`

---

## Floor – patra centra

**Soubor:** `server/models/Floor.ts`
**Kolekce:** `floors`

### Pole

| Pole | Typ | Povinné | Validace | Popis |
|---|---|---|---|---|
| `name` | String | Ano | trim, maxlength: 50 | Název patra |
| `level` | Number | Ano | index | Číslo patra |
| `mapImage` | String | Ne | – | URL obrázku mapy (legacy) |
| `svgMap` | String | Ne | – | Cesta k SVG souboru mapy patra |
| `isActive` | Boolean | Ne | default: true | Aktivní |
| `sortOrder` | Number | Ne | default: 0 | Pořadí |

### Indexy

- `level: 1` (přímý)
- `isActive: 1, sortOrder: 1`

### Poznámka

`svgMap` je cesta k souboru SVG uložená jako string. Endpoint `GET /api/map/units` tento soubor čte ze souborového systému a dynamicky extrahuje kódy jednotek.

---

## GeneralInfo – obecné informace o centru (singleton)

**Soubor:** `server/models/GeneralInfo.ts`
**Kolekce:** `generalinfos`

### Pole

| Pole | Typ | Validace | Popis |
|---|---|---|---|
| `title` | String | maxlength: 200, trim | Název sekce |
| `shortText` | String | maxlength: 500, trim | Krátký popis |
| `text` | String | maxlength: 10000 | Hlavní text (HTML) |
| `openingHours` | [OpeningHoursEntry] | – | Otevírací doby centra |
| `specialOpeningHours` | [SpecialOpeningHours] | – | Výjimky (svátky apod.) |
| `facebook` | String | trim | URL |
| `instagram` | String | trim | URL |
| `gallery` | [String] | – | Pole URL obrázků |
| `staticAroundMap` | String | trim | Cesta k SVG okolí centra |
| `parkingContent` | String | maxlength: 1000 | Text o parkování |
| `parkingImage` | String | – | URL obrázku parkování |
| `parkingOtherInfo` | String | maxlength: 10000 | Doplňující info (HTML) |
| `contacts` | [Contact] | – | Kontaktní osoby |

### Sub-schema: Contact

```typescript
{
  title?: string   // max 100 znaků, trim
  name?: string    // max 100 znaků, trim
  phone?: string   // max 30 znaků, trim
  email?: string   // max 100 znaků, trim
}
```

### Chování

Používá statickou metodu `getOrCreate()` – vždy vrátí jeden (první) záznam nebo ho vytvoří.
`staticAroundMap` je chráněno `requireSuperAdmin` – jen superadmin může editovat.

---

## Homepage – nastavení hlavní stránky (singleton)

**Soubor:** `server/models/Homepage.ts`
**Kolekce:** `homepages`

### Pole

| Pole | Typ | Výchozí | Popis |
|---|---|---|---|
| `heroImage` | String | – | URL hero obrázku |
| `showHeroBorder` | Boolean | `true` | Zobrazit dekorativní okraj |

### Chování

Singleton přes `Homepage.getOrCreate()`. Editovatelné přes `PUT /api/homepage` (`editor+`).

---

## Vazby mezi modely

```
Shop ──────────┬──── floorId (ref: Floor)      @deprecated
               ├──── floorIds[] (ref: Floor)   ← preferované
               └──── categoryIds[] (ref: Category)

Event ──────────── shopId (ref: Shop)

Session ─────────── userId (ref: User)
```

---

## Konvence modelů

- Všechny modely používají `timestamps: true` (automatické `createdAt`, `updatedAt`)
- `toJSON` transformace odstraňuje `__v` a převádí `_id` na string
- Heslo je chráněno `select: false` – musí být explicitně požadováno `.select('+password')`
- HMR ochrana: `mongoose.models.ModelName || mongoose.model(...)` zabraňuje re-registraci modelu při hot-reload
