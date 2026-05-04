# CMS - Content Management System

CMS je interní administrace pro správu obsahu OC Plaza Liberec. Běží pod `/cms/*`, používá layout `app/layouts/cms.vue` a chrání se route middlewarem `app/middleware/cms.ts`.

---

## Přístup

```text
https://ocplazaliberec.cz/cms/login
```

Přihlášení probíhá e-mailem a heslem. Po přihlášení server nastaví HTTP-only cookies:

- `access_token`
- `refresh_token`

A zároveň non-httpOnly CSRF cookie:

- `csrf_token`

CSRF token používá composable `useCmsAuth().secureFetch()` u chráněných write operací, které CSRF na serveru vyžadují.

---

## Middleware

Soubor: `app/middleware/cms.ts`

Chování:

1. `/cms/login` je přístupný bez přihlášení.
2. Ostatní `/cms/*` stránky volají `GET /api/auth/me`.
3. Při úspěchu se uživatel uloží do `useState('cms-user')`.
4. Při 401 se uživatel přesměruje na `/cms/login`.
5. `/cms/spravci/**` vyžaduje roli `admin` nebo `superadmin`; jinak middleware vrátí 403.

CMS stránky jsou zároveň vyloučené z indexace přes route rules a server middleware `server/middleware/noindex-cms.ts`.

---

## Layout a menu

Soubor: `app/layouts/cms.vue`

CMS používá responzivní sidebar. Na desktopu je sidebar pevně vlevo, na mobilu se otevírá přes hamburger.

Menu obsahuje:

- Dashboard
- Hlavní stránka
- Kategorie
- Obchody
- Patra
- Mapa
- Akce
- Novinky
- Služby
- O nás
- Parkování
- Kontakty
- Správci (jen admin/superadmin)
- Můj účet
- Odhlášení

Flash zprávy se zobrazují přes `CmsFlashMessages` a composable `useFlashMessages`.

---

## Role

| Role | Popis |
|---|---|
| `editor` | Správa obsahu bez správy uživatelů |
| `admin` | Správa obsahu a správců kromě superadminů |
| `superadmin` | Plný přístup včetně technických SVG mapových podkladů |

Serverové helpery:

- `requireAuth`
- `requireEditor`
- `requireAdmin`
- `requireSuperAdmin`

---

## Přehled oprávnění

| Sekce / akce | superadmin | admin | editor |
|---|---|---|---|
| Dashboard | ano | ano | ano |
| Obchody - vytvoření/editace | ano | ano | ano |
| Obchody - smazání | ano | ano | ne |
| Kategorie - vytvoření/editace/řazení | ano | ano | ano |
| Kategorie - smazání | ano | ano | ne |
| Patra - vytvoření/editace/řazení | ano | ano | ano |
| Patra - smazání | ano | ano | ne |
| SVG mapa patra (`svgMap`) | ano | ne | ne |
| Mapa - přiřazení obchodu k jednotce | ano | ano | ano |
| Mapa - soukromě obsazené jednotky | ano | ano | ano |
| Statická mapa okolí (`staticAroundMap`) | ano | ne | ne |
| Akce - vytvoření/editace/řazení | ano | ano | ano |
| Akce - smazání | ano | ano | ne |
| Novinky - vytvoření/editace/řazení | ano | ano | ano |
| Novinky - smazání | ano | ano | ne |
| Služby - vytvoření/editace/řazení | ano | ano | ano |
| Služby - smazání | ano | ano | ne |
| Hlavní stránka | ano | ano | ano |
| O nás / Parkování / Kontakty | ano | ano | ano |
| Správci | ano | ano | ne |
| Můj účet | ano | ano | ano |

Poznámka: server u některých write endpointů kontroluje role přes API. UI může některé akce skrýt, ale rozhodující je serverová kontrola.

---

## Dashboard - `/cms`

Soubor: `app/pages/cms/index.vue`

Dashboard načítá základní statistiky z veřejných API endpointů:

- počet obchodů z `/api/shops`,
- počet akcí z `/api/events`,
- počet služeb z `/api/services`.

Dále zobrazuje:

- poslední novinky,
- poslední akce,
- rychlé odkazy pro vytvoření obchodu, akce a služby.

Neexistuje samostatný `/api/stats` endpoint.

---

## Obchody - `/cms/obchody`

Soubory:

- `app/pages/cms/obchody/index.vue`
- `app/pages/cms/obchody/novy.vue`
- `app/pages/cms/obchody/[id].vue`

Formulář obchodu obsahuje:

- název,
- slug (ručně nebo automaticky z názvu),
- krátký popis,
- dlouhý WYSIWYG popis,
- logo,
- galerii,
- telefon,
- e-mail,
- web,
- Facebook a Instagram,
- výběr kategorií,
- výběr jednoho nebo více pater (`floorIds`),
- výběr jedné nebo více jednotek mapy (`unitCodes`),
- běžnou otevírací dobu,
- speciální otevírací dobu,
- SEO titulek a popis,
- `isActive`,
- `publishDate`.

Legacy pole `floorId` a `unitCode` se při ukládání stále vyplňují z první položky `floorIds`/`unitCodes` kvůli zpětné kompatibilitě.

`publishDate` není plnohodnotné embargo. Aktivní obchod s budoucím `publishDate` se na veřejných kartách a v mapě zobrazuje jako připravovaný/"Otevíráme", ale detail lze technicky stále načíst, pokud je známá URL a obchod je aktivní.

Mazání obchodů vyžaduje `admin+`.

---

## Kategorie - `/cms/kategorie`

Soubory:

- `app/pages/cms/kategorie/index.vue`
- `app/pages/cms/kategorie/nova.vue`
- `app/pages/cms/kategorie/[id].vue`

Pole:

- název,
- slug,
- aktivní stav,
- pořadí.

Kategorie lze řadit drag & drop přes `PUT /api/categories/reorder`.

Veřejný filtr používá aktivní kategorie, typicky s query `withShopsOnly=true`, aby se zobrazily jen kategorie s alespoň jedním aktivním obchodem.

Smazání kategorie vyžaduje `admin+` a API zabrání smazání kategorie, která je přiřazená k obchodům.

---

## Patra - `/cms/patra`

Soubory:

- `app/pages/cms/patra/index.vue`
- `app/pages/cms/patra/novy.vue`
- `app/pages/cms/patra/[id].vue`

Pole:

- název,
- číselná úroveň (`level`),
- aktivní stav,
- pořadí,
- SVG mapa patra (`svgMap`) - pouze superadmin,
- soukromě obsazené jednotky (`privateOccupiedUnitCodes`) - používá mapa.

Patra lze řadit drag & drop přes `PUT /api/floors/reorder`.

Na stránce seznamu pater je také sekce pro statickou mapu okolí centra (`staticAroundMap`). Tu může nahrát nebo odebrat pouze superadmin.

Poznámka: API pro smazání patra aktuálně kontroluje vazby obchodů přes legacy `floorId`. U obchodů používajících jen `floorIds` je potřeba při mazání patra postupovat opatrně.

---

## Mapa - `/cms/mapa`

Soubor: `app/pages/cms/mapa/index.vue`

CMS mapa načítá data z `GET /api/map/units`.

Umí:

- zobrazit statistiky jednotek,
- přepínat patra,
- zobrazit interaktivní SVG mapu,
- zobrazit tabulku jednotek,
- přiřadit obchod k jednotce,
- odebrat obchod z jednotky,
- označit jednotku jako soukromě obsazenou,
- vrátit soukromě obsazenou jednotku na prázdnou,
- exportovat mapu patra jako SVG.

Barvy/stavy v CMS:

- obsazený obchod,
- připravovaný obchod podle budoucího `publishDate`,
- soukromě obsazená jednotka,
- prázdná jednotka.

Při přiřazení jednotky se upravuje obchod:

- `unitCodes`
- `floorIds`
- legacy `unitCode`
- legacy `floorId`

U soukromé obsazenosti se upravuje patro:

- `privateOccupiedUnitCodes`

---

## Akce - `/cms/akce`

Soubory:

- `app/pages/cms/akce/index.vue`
- `app/pages/cms/akce/nova.vue`
- `app/pages/cms/akce/[id].vue`

Pole:

- interní název,
- čtvercový obrázek,
- obchod (`shopId`),
- WYSIWYG obsah,
- aktivní stav,
- pořadí,
- datum `displayUntil`.

Veřejný web používá `isActive=true` a `notExpired=true`, takže akce s prošlým `displayUntil` se na webu nezobrazí.

Řazení probíhá přes `PUT /api/events/reorder`.

Mazání akcí vyžaduje `admin+`.

Endpointy `/api/events/:id/publish` a `/api/events/:id/unpublish` v kódu existují jako legacy endpointy, ale aktuální model a UI pracují s `isActive`. Nemají se používat jako primární publikační mechanismus.

---

## Novinky - `/cms/novinky`

Soubory:

- `app/pages/cms/novinky/index.vue`
- `app/pages/cms/novinky/nova.vue`
- `app/pages/cms/novinky/[id].vue`

Pole:

- interní název,
- čtvercový obrázek,
- WYSIWYG obsah,
- aktivní stav,
- pořadí,
- datum `displayUntil`.

Novinky nejsou navázané na obchod.

Veřejný web používá `isActive=true` a `notExpired=true`.

Řazení probíhá přes `PUT /api/news/reorder`.

Mazání novinek vyžaduje `admin+`.

---

## Služby - `/cms/sluzby`

Soubory:

- `app/pages/cms/sluzby/index.vue`
- `app/pages/cms/sluzby/nova.vue`
- `app/pages/cms/sluzby/[id].vue`

Pole:

- ikona,
- krátký popisek,
- WYSIWYG detailní popis,
- aktivní stav,
- pořadí.

Služby se zobrazují na stránce O nás. Pokud mají detail, otevírají se v modalu.

Řazení probíhá přes `PUT /api/services/reorder`.

Mazání služeb vyžaduje `admin+`.

---

## Hlavní stránka - `/cms/hlavni-stranka`

Soubor: `app/pages/cms/hlavni-stranka.vue`

Edituje singleton `Homepage`.

Pole:

- `heroImage`
- `showHeroBorder`

Ostatní části homepage se skládají z dalších dat: obchody, akce, novinky, mapa a obecné informace.

---

## O nás - `/cms/o-nas`

Soubor: `app/pages/cms/o-nas.vue`

Edituje singleton `GeneralInfo`.

Pole:

- `title`
- `shortText`
- `text`
- `gallery`
- `specialOpeningHours` pro centrum

---

## Parkování - `/cms/parkovani`

Soubor: `app/pages/cms/parkovani.vue`

Edituje část `GeneralInfo`.

Pole:

- `parkingContent`
- `parkingImage`
- `parkingOtherInfo`

Pokud není `parkingImage` nastavený, veřejný web použije `/images/default-parking.jpg`.

---

## Kontakty - `/cms/kontakty`

Soubor: `app/pages/cms/kontakty.vue`

Edituje část `GeneralInfo`.

Pole:

- otevírací doba centra,
- kontaktní osoby,
- Facebook,
- Instagram.

Kontakt obsahuje:

- `title`
- `name`
- `phone`
- `email`

Maximum je 30 kontaktů.

---

## Správci - `/cms/spravci`

Soubory:

- `app/pages/cms/spravci/index.vue`
- `app/pages/cms/spravci/novy.vue`
- `app/pages/cms/spravci/[id].vue`

Přístup: `admin` nebo `superadmin`.

Pole:

- e-mail,
- jméno,
- heslo,
- role,
- aktivní stav.

Pravidla:

- editor nemá přístup,
- admin nemůže vytvářet, upravovat ani mazat superadmin účty,
- superadmin může spravovat všechny role,
- uživatel nemůže smazat vlastní účet,
- při smazání uživatele se invalidují jeho sessions.

Create/update/delete endpointy pro uživatele vyžadují CSRF token.

---

## Můj účet - `/cms/ucet`

Soubor: `app/pages/cms/ucet.vue`

Stránka zobrazuje:

- jméno,
- e-mail,
- roli,
- formulář pro změnu hesla.

Změna hesla vyžaduje aktuální heslo a CSRF token. Aktuální implementace po změně hesla automaticky neodhlašuje ostatní sessions.

---

## Upload souborů

Endpoint: `POST /api/upload`

Vlastnosti:

- role `editor+`,
- field `file`,
- povolené MIME typy: JPEG, PNG, WebP, GIF, SVG,
- limit 3 MB,
- název souboru je UUID,
- odpověď obsahuje `url`, `filename`, `size`, `type`.

V produkci se soubory ukládají do:

```text
.output/public/uploads
```

Při deployi musí být tato cesta napojená na persistentní storage.

---

## WYSIWYG editor

Komponenta: `app/components/cms/Wysiwyg.vue`

Používá Tiptap:

- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-underline`
- `@tiptap/extension-text-align`
- `@tiptap/extension-table`
- `@tiptap/extension-table-row`
- `@tiptap/extension-table-header`
- `@tiptap/extension-table-cell`

HTML se ukládá do databáze a na veřejném webu se sanitizuje přes `useSanitizeHtml`.
