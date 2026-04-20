# CMS – Content Management System

CMS je interní nástroj pro správu obsahu OC Plaza Liberec. Je přístupný na `/cms/*` a chráněn JWT autentizací.

---

## Přístup do CMS

```
https://ocplazaliberec.cz/cms/login
```

Přihlašuje se emailem a heslem. Po přihlášení jsou nastaveny HTTP-only cookies (`access_token`, `refresh_token`, `csrf_token`).

---

## Middleware a ochrana

Soubor: `app/middleware/cms.ts`

Middleware se spouští na každé navigaci v rámci `/cms/*` (kromě `/cms/login`):

1. Zavolá `GET /api/auth/me` s cookies z requestu (SSR i CSR)
2. Uloží uživatele do `useState('cms-user')`
3. Při chybě 401 → přesměruje na `/cms/login`
4. Pro cesty `/cms/spravci/**` zkontroluje roli – pokud není `admin` ani `superadmin`, vyhodí 403

---

## Layout CMS

Soubor: `app/layouts/cms.vue`

- Fixní postranní sidebar (sidebar se skrývá na mobilu, otevírá přes hamburger)
- Responzivní: sidebar překrývá obsah na mobilu, je vedle obsahu na desktopu
- Flash zprávy (`CmsFlashMessages`) zobrazené nad obsahem
- Navigace obsahuje:
  - Dashboard
  - Obchody
  - Akce
  - Novinky
  - Služby
  - Kategorie
  - Patra
  - Mapa
  - Kontakty / O nás
  - Parkování
  - Hlavní stránka
  - Správci (**pouze admin/superadmin**)
  - Můj účet
  - Odhlásit se

---

## CMS sekce

### Dashboard – `/cms`

- Zobrazuje statistiky: počet obchodů, akcí, novinek, služeb
- Data načítá přímo z API

---

### Obchody – `/cms/obchody`

| Stránka | URL | Popis |
|---|---|---|
| Seznam | `/cms/obchody` | Tabulka (desktop) / karty (mobile), filtrování, stránkování |
| Nový | `/cms/obchody/novy` | Formulář pro vytvoření obchodu |
| Editace | `/cms/obchody/:id` | Formulář pro úpravu existujícího obchodu |

**Formulář obchodu obsahuje:**
- Základní info: název, slug (auto-generován z názvu), krátký popis, dlouhý popis (WYSIWYG)
- Kontakty: telefon, email, web, sociální sítě
- Umístění: výběr pater (`floorIds`), výběr kategorií (`categoryIds`), kódy jednotek (`unitCodes`)
- Média: logo, galerie obrázků (upload přes `/api/upload`)
- Otevírací doby: standardní + speciální výjimky
- SEO: titulek (max 60 znaků), popis (max 160 znaků)
- Publikace: přepínač `isActive`, datum zveřejnění `publishDate`

**Oprávnění:**
- Zobrazení a úpravy: `editor`, `admin`, `superadmin`
- Smazání: pouze `admin`, `superadmin`

---

### Akce – `/cms/akce`

| Stránka | URL | Popis |
|---|---|---|
| Seznam | `/cms/akce` | Drag & drop řazení, filtrování |
| Nová | `/cms/akce/nova` | Formulář |
| Editace | `/cms/akce/:id` | Formulář |

**Formulář akce obsahuje:**
- Interní název (pro CMS, nezobrazuje se na webu)
- Čtvercový obrázek (upload)
- Vazba na obchod (výběr z existujících)
- Obsah (WYSIWYG – volitelný)
- `isActive`, `sortOrder`

**Reorder:** Drag & drop v seznamu → `PUT /api/events/reorder` s polem ID v novém pořadí.

**Oprávnění:** `editor+`

---

### Novinky – `/cms/novinky`

Stejná struktura jako akce. Novinky nemají vazbu na obchod.

**Formulář:**
- Interní název
- Čtvercový obrázek
- Obsah (WYSIWYG)
- `isActive`, `sortOrder`

**Reorder:** `PUT /api/news/reorder`

**Oprávnění:** `editor+`

---

### Služby – `/cms/sluzby`

| Stránka | URL | Popis |
|---|---|---|
| Seznam | `/cms/sluzby` | Drag & drop řazení |
| Nová | `/cms/sluzby/nova` | Formulář |
| Editace | `/cms/sluzby/:id` | Formulář |

**Formulář:**
- Ikona (upload – SVG nebo PNG)
- Popisek (max 120 znaků – zobrazuje se na webu)
- Popis (WYSIWYG – detailní obsah modalu)
- `isActive`, `sortOrder`

**Reorder:** `PUT /api/services/reorder`

**Oprávnění:** `editor+`

---

### Kategorie – `/cms/kategorie`

Správa kategorií obchodů.

**Formulář:**
- Název (max 100 znaků)
- Slug (auto-generován nebo ruční)
- `isActive`, `sortOrder`

**Reorder:** `PUT /api/categories/reorder`

**Oprávnění:** `editor+`

---

### Patra – `/cms/patra`

Správa pater obchodního centra.

**Formulář:**
- Název (max 50 znaků)
- Číslo patra (`level`)
- SVG mapa patra (`svgMap`) – cesta k souboru
- `isActive`, `sortOrder`

**Reorder:** `PUT /api/floors/reorder`

**Oprávnění:** `editor+`

---

### Kontakty a otevírací doby – `/cms/kontakty`

Editace singleton modelu `GeneralInfo` – sekce kontaktů:

- Otevírací doby centra (standardní + speciální výjimky)
- Kontaktní osoby (jméno, titul, telefon, email)
- Sociální sítě (Facebook, Instagram)

**Oprávnění:** `editor+`

---

### O nás – `/cms/o-nas`

Editace `GeneralInfo` – sekce obsahu stránky O nás:

- Nadpis
- Krátký text (max 500 znaků)
- Hlavní text (WYSIWYG)
- Galerie obrázků

**Oprávnění:** `editor+`

---

### Parkování – `/cms/parkovani`

Editace `GeneralInfo` – sekce parkování:

- Text o parkování (max 1000 znaků)
- Obrázek parkoviště
- Doplňující informace (WYSIWYG, max 10000 znaků)

**Oprávnění:** `editor+`

---

### Mapa – `/cms/mapa`

Správa mapování obchodů na SVG mapu. Obsahuje:
- Editace `staticAroundMap` (cesta k SVG okolí centra) – **pouze `superadmin`**
- Ostatní mapové operace – `editor+`

---

### Hlavní stránka – `/cms/hlavni-stranka`

Editace singleton modelu `Homepage`:
- Hero obrázek (upload)
- Přepínač `showHeroBorder`

**Oprávnění:** `editor+`

---

### Správci – `/cms/spravci`

**Přístup: pouze `admin` a `superadmin`**

| Stránka | URL | Popis |
|---|---|---|
| Seznam | `/cms/spravci` | Tabulka (desktop) / karty (mobile) |
| Nový | `/cms/spravci/novy` | Formulář |
| Editace | `/cms/spravci/:id` | Formulář |

**Formulář:**
- Email (unikátní)
- Jméno (2–100 znaků)
- Heslo (min. 8 znaků – povinné při vytvoření, volitelné při editaci)
- Role (`admin`, `editor`) – `superadmin` roli nelze přiřadit přes UI
- `isActive`

**Ochrana:**
- Nelze smazat vlastní účet
- Při smazání se invalidují všechny sessions uživatele
- Editor a níže nemá přístup k tomuto menu (403 nebo schování v navigaci)

---

### Můj účet – `/cms/ucet`

Dostupné pro všechny přihlášené uživatele:
- Zobrazení vlastních informací (jméno, email, role)
- Formulář pro změnu hesla (`POST /api/auth/change-password`)
- Role je zobrazena barevným štítkem (superadmin = zlatý, admin = fialový, editor = modrý)

---

## Práva v CMS – přehledová tabulka

| Sekce | superadmin | admin | editor |
|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ |
| Obchody (zobrazení, vytvoření, editace) | ✓ | ✓ | ✓ |
| Obchody (smazání) | ✓ | ✓ | ✗ |
| Akce | ✓ | ✓ | ✓ |
| Novinky | ✓ | ✓ | ✓ |
| Služby | ✓ | ✓ | ✓ |
| Kategorie | ✓ | ✓ | ✓ |
| Patra | ✓ | ✓ | ✓ |
| Kontakty / O nás / Parkování | ✓ | ✓ | ✓ |
| Mapa (obecné) | ✓ | ✓ | ✓ |
| Mapa (staticAroundMap) | ✓ | ✗ | ✗ |
| Hlavní stránka | ✓ | ✓ | ✓ |
| Správci | ✓ | ✓ | ✗ |
| Můj účet | ✓ | ✓ | ✓ |

---

## Upload souborů v CMS

Všechny obrázky v CMS se nahrávají přes `POST /api/upload`:
- Povolené typy: JPEG, PNG, WebP, GIF, SVG
- Maximální velikost: 3 MB
- Soubory jsou ukládány s UUID názvem (immutable cache)
- Výsledná URL: `/api/uploads/<uuid>.<ext>`

---

## Flash zprávy

CMS používá composable `useFlashMessages` pro zobrazení zpětné vazby uživateli. Zprávy přežívají navigaci mezi stránkami (uloženy v `useState`).

Typy zpráv a výchozí timeouty:
- `success` – 4 000 ms
- `error` – 8 000 ms
- `warning` – 6 000 ms
- `info` – 5 000 ms

---

## WYSIWYG editor

Pro editaci HTML obsahu (popis obchodu, obsah akce, obsah novinky apod.) se používá **Tiptap** s rozšířeními:
- `@tiptap/starter-kit` – základní bloky
- `@tiptap/extension-link` – odkazy
- `@tiptap/extension-image` – obrázky
- `@tiptap/extension-underline` – podtržení
- `@tiptap/extension-text-align` – zarovnání
- `@tiptap/extension-table` (+ TableRow, TableHeader, TableCell) – tabulky
