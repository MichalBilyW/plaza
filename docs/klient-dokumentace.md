# OC Plaza Liberec – Dokumentace webového systému

*Verze dokumentu: duben 2026*

---

## 1. Úvod

Tento dokument popisuje webový systém OC Plaza Liberec. Je určen pro provozovatele webu, správce obsahu a osoby odpovědné za každodenní chod webu.

Cílem webu je prezentovat obchodní centrum návštěvníkům: informovat je o nabídce obchodů, aktuálních akcích, otevírací době a umožnit jim orientaci v centru prostřednictvím interaktivní mapy.

Systém se skládá ze dvou propojených částí:

- **Veřejný web** – stránky pro návštěvníky obchodního centra
- **Administrace (CMS)** – uzavřené prostředí pro správu veškerého obsahu

---

## 2. Přehled řešení

### Veřejný web

Veřejný web obsahuje tyto hlavní stránky:

| Stránka | Adresa | Obsah |
|---|---|---|
| Úvodní stránka | `/` | Hero obrázek, novinky, nadcházející akce, vybrané obchody, interaktivní mapa |
| Přehled obchodů | `/obchody` | Úplný seznam obchodů s filtrováním |
| Detail obchodu | `/obchody/nazev-obchodu` | Stránka konkrétního obchodu s popisem, otevírací dobou, galerií |
| Interaktivní mapa | `/mapa` | Grafická mapa pater centra s obchody |
| Akce | `/akce` | Nadcházející a probíhající akce |
| O nás | `/o-nas` | Informace o centru, otevírací doba, galerie |
| Cookies | `/cookies` | Informace o cookies |

### Administrace (CMS)

Administrace je přístupná na adrese `/cms`. Přihlásit se mohou pouze oprávnění uživatelé. Po přihlášení mohou spravovat veškerý obsah webu.

---

## 3. Co systém umožňuje

### Návštěvník webu

- Prohlížet seznam obchodů a filtrovat je podle kategorie, patra nebo vyhledávat podle názvu
- Zobrazit detail každého obchodu: popis, otevírací dobu, kontakty, galerii, sociální sítě
- Orientovat se na interaktivní mapě pater – po kliknutí na libovolnou oblast mapy se zobrazí informace o obchodu a přímý odkaz na jeho detail
- Zobrazit aktuální akce obchodního centra
- Zjistit obecné informace o centru (otevírací dobu, kontakty, parkování)
- Spravovat svůj souhlas s cookies

### Správce obsahu (editor, administrátor)

- Přidávat, upravovat a deaktivovat obchody
- Přidávat, upravovat a deaktivovat akce
- Přidávat, upravovat a deaktivovat novinky
- Spravovat nabízené služby centra
- Upravovat obecné informace, otevírací dobu, kontakty, parkování
- Spravovat úvodní stránku
- Nahrávat obrázky a přiřazovat je k obchodům, akcím a novinám

### Administrátor

- Vše výše uvedené
- Navíc: přidávat, upravovat a deaktivovat uživatelské účty správců

---

## 4. Struktura obsahu a správy

### Obchody

Obchod je základní jednotka obsahu. Každý obchod má:

- **Název a popis** – textový obsah s možností formátování (tučné, kurzíva, nadpisy, odrážky, tabulky, odkazy)
- **Krátký popis** – max. 120 znaků, zobrazuje se v přehledech (např. na mapě)
- **Logo a galerie** – nahrané obrázky
- **Kontakty** – telefon, e-mail, webová stránka, sociální sítě (Facebook, Instagram, Twitter)
- **Umístění** – přiřazení k patru (nebo více patrům, pokud obchod zabírá více pater), propojení s jednotkou na mapě
- **Kategorie** – zařazení do jedné nebo více kategorií
- **Otevírací doba** – pro každý den v týdnu zvlášť, s možností označit den jako zavřeno
- **Speciální otevírací doba** – výjimky pro svátky nebo konkrétní dny
- **SEO nastavení** – vlastní název a popis stránky pro vyhledávače
- **Stav** – aktivní / neaktivní

Neaktivní obchod se na veřejném webu nezobrazuje a nevystupuje v mapě.

Obchod lze přiřadit k více patrům najednou (pokud zabírá např. přízemí i první patro).

### Akce

Každá akce je vázána na konkrétní obchod. Obsahuje:

- Název a podrobný popis
- Datum konání (od–do)
- Obrázek
- Odkaz na přidružený obchod
- Stav (aktivní / neaktivní)

Akce bez přiřazeného obchodu nelze vytvořit.

### Novinky

Novinky jsou nezávislé na obchodech – jde o obecné zprávy centra. Obsahují název, popis, obrázek a stav.

### Služby

Přehled služeb, které centrum nabízí návštěvníkům (např. dětský koutek, úschovna, bankomaty apod.). Každá služba má ikonu, krátký popis a podrobný text.

### Kategorie

Slouží k třídění obchodů. Každá kategorie má název. Ke kategorii je automaticky počítáno, kolik aktivních obchodů do ní patří.

### Obecné informace (O nás, Kontakty, Parkování)

Jde o jednu společnou sadu dat, která se projevuje na několika místech webu:

- **O nás** – název centra, popisný text, galerie fotek, otevírací doba centra, speciální otevírací doba, sociální sítě
- **Kontakty** – seznam kontaktních osob (název/funkce, jméno, telefon, e-mail); maximálně 30 kontaktů
- **Parkování** – text s informacemi o parkování, fotka parkoviště, doplňující informace

Tyto sekce jsou společné – existuje vždy jeden záznam, který se edituje (nelze přidávat více verzí).

### Úvodní stránka

Správa hero obrázku v záhlaví úvodní stránky a přepínač dekorativního rámečku kolem obrázku.

### Interaktivní mapa

Mapa obchodního centra je zobrazena jako SVG grafika (vektorový soubor) pro každé patro. Správce v CMS vidí přehled obsazenosti – celkový počet jednotek, obsazené jednotky, prázdné jednotky a procentuální obsazenost. Samotné SVG soubory a propojení s mapou zajišťuje technický správce.

---

## 5. Uživatelské role a oprávnění

Systém rozlišuje tři úrovně přístupu:

### Editor

Základní role pro správu obsahu. Editor může:

- Spravovat obchody, akce, novinky, služby, kategorie, patra
- Upravovat obecné informace (O nás, kontakty, parkování)
- Spravovat úvodní stránku
- Nahrávat obrázky

Editor **nemůže** spravovat uživatelské účty ostatních správců.

### Administrátor

Obsahuje vše jako editor a navíc:

- Spravovat uživatelské účty (přidávat, upravovat, deaktivovat editory i další administrátory)

Administrátor **nemůže** spravovat účty jiných administrátorů a superadministrátorů.

### Superadministrátor

Nejvyšší úroveň přístupu. Superadministrátor může vše výše zmíněné a navíc:

- Spravovat uživatelské účty na všech úrovních
- Upravovat speciální část dat (statická mapa okolí)

Roli superadministrátora přiřazuje pouze technický správce systému.

---

## 6. Přihlášení a zabezpečení

### Přihlášení do administrace

Administrace je dostupná na adrese `/cms/login`. Pro přihlášení je potřeba e-mail a heslo.

Po přihlášení zůstane uživatel přihlášen po dobu **7 dní**. Pokud v té době aktivně pracuje se systémem, přihlášení se automaticky obnovuje.

### Souběžné přihlášení na více zařízeních

Systém umožňuje být přihlášen na více zařízeních zároveň (například na pracovním počítači a telefonu). Každé zařízení má vlastní nezávislé přihlášení.

### Odhlášení a zneplatnění přístupu

- Ruční odhlášení okamžitě zneplatní přihlášení pouze na daném zařízení.
- Změna hesla zneplatní **všechna aktivní přihlášení** na všech zařízeních. Tím je zajištěno, že i v případě odcizeného přístupu se neautorizovaná osoba nemůže dál přihlásit.

### Ochrana před opakovanými pokusy o přihlášení

Po 5 neúspěšných pokusech o přihlášení z jedné adresy je přihlášení zablokováno na 30 minut. Toto opatření chrání systém před automatickými útoky.

### Bezpečnost dat

- Hesla jsou uložena v zašifrované podobě – nikdo (včetně technického správce) nemůže zobrazit heslo v původní podobě.
- Přihlašovací tokeny jsou uloženy v bezpečných cookies, které nejsou přístupné z webových skriptů.
- Veškerá komunikace se systémem probíhá šifrovaně (HTTPS).

---

## 7. Běžná správa obsahu

### Přidání nového obchodu

1. V administraci přejít do sekce **Obchody**
2. Kliknout na **Přidat obchod**
3. Vyplnit: název, popis, logo, galerii, kontaktní informace, patro, kategorii, otevírací dobu
4. Uložit – obchod se zobrazí jako aktivní na webu

### Deaktivace obchodu

Obchod lze přepnout do stavu „neaktivní". Takový obchod se okamžitě přestane zobrazovat na veřejném webu, zůstane však v systému a lze ho kdykoli znovu aktivovat.

### Správa akcí

Každá akce musí být přiřazena k existujícímu obchodu. Akci lze deaktivovat bez smazání – vhodné pro opakující se akce.

### Speciální otevírací doba

Jak u obchodů, tak u celého centra lze nastavit výjimky z běžné otevírací doby pro konkrétní datum nebo rozsah dat (například svátky). Tyto výjimky mají přednost před standardní otevírací dobou.

### Správa kontaktů

V sekci **Kontakty** lze spravovat seznam kontaktních osob zobrazovaných na webu. Maximální počet kontaktů je **30**. Pokud je tento limit dosažen, tlačítko pro přidání dalšího kontaktu se nezobrazí.

### Nahrávání obrázků

- Povolené formáty: JPG, PNG, WEBP, GIF, SVG
- Maximální velikost jednoho souboru: **3 MB**
- Obrázky jsou po nahrání dostupné ihned

### Pořadí obsahu

Akce v přehledu lze přeuspořádat přetažením (drag & drop) přímo v administraci. Toto pořadí se projeví na veřejném webu.

### Úprava formátovaného textu

Popisy obchodů, novinky a další delší texty se editují pomocí vizuálního textového editoru (WYSIWYG), který umožňuje formátovat text bez znalosti HTML. Dostupné možnosti: tučné, kurzíva, podtržení, přeškrtnutí, nadpisy, odrážky, číslované seznamy, tabulky, hypertextové odkazy, vložení obrázku.

---

## 8. Provozní informace

### Kde systém běží

Systém je provozován na dedikovaném serveru (Hetzner) pomocí kontejnerizovaného prostředí (Docker), spravovaného přes platformu Coolify. Data jsou uložena v databázi MongoDB.

### Nahrané soubory

Nahrané obrázky jsou ukládány na serveru mimo zálohu repozitáře. Je nezbytné, aby provozovatel zajistil jejich **pravidelnou zálohu**. Při obnovení systému nebo přesunu na nový server musí být obrázky přeneseny zvlášť.

### Záloha databáze

Systém obsahuje skripty pro zálohu databáze. Záloha vytvoří složku s daty ke konkrétnímu datu a času. Zálohu je nutné provádět manuálně nebo naplánovat automaticky – záloha neběží sama od sebe, pokud to technický správce nenastavil.

### Závislosti systému

Systém vyžaduje:

- Funkční MongoDB databázi – bez ní web nefunguje
- Přístup k internetu pro načítání externích služeb (Google Analytics, cookie lišta)

---

## 9. Doporučení pro klienta

1. **Pravidelná záloha** – Domluvte s technickým správcem automatickou zálohu databáze i nahraných obrázků, ideálně denně.

2. **Správa hesel** – Každý správce by měl mít vlastní přihlašovací údaje. Nikdy nesdílejte heslo mezi více osobami. Po odchodu zaměstnance okamžitě deaktivujte jeho účet.

3. **Silná hesla** – Používejte hesla minimálně 12 znaků, kombinaci písmen, číslic a speciálních znaků.

4. **Aktuálnost obsahu** – Pravidelně kontrolujte, zda jsou otevírací doby obchodů aktuální, zejména před svátky. Neaktuální otevírací doba může způsobit stížnosti od návštěvníků.

5. **Deaktivace místo mazání** – Pokud obchod nebo akce dočasně neplatí, doporučujeme je deaktivovat, nikoli smazat. Data lze kdykoli obnovit.

6. **Nahrávání obrázků** – Nahrávejte obrázky v přiměřené velikosti (do 3 MB). Příliš velké soubory zpomalují web. Doporučujeme formát WEBP pro fotografie a SVG pro loga.

7. **Testování po změnách** – Po větších úpravách obsahu si vždy prohlédněte, jak se změna projevila na veřejném webu, ideálně ve více různých prohlížečích.

8. **Správci s minimálními oprávněními** – Přidělujte roli editor těm, kteří nepotřebují spravovat uživatele. Roli administrátor svěřte pouze odpovědným osobám.

---

## 10. Omezení a důležité poznámky

- **Mapu nelze editovat přímo v administraci** – Grafická mapa pater (SVG soubory) je technický prvek, který vyžaduje ruční úpravu od vývojáře. Propojení obchodů s mapou (přiřazení kódu jednotky) lze spravovat v CMS, ale grafiku mapy samotné nikoli.

- **Akce musí mít obchod** – Nelze vytvořit akci bez přiřazení ke konkrétnímu obchodu. Pokud jde o akci celého centra (ne jednoho obchodu), je třeba s vývojářem domluvit rozšíření.

- **Maximálně 30 kontaktů** – Sekce kontaktů je omezena na 30 záznamů. Pokud je limit nevyhovující, je potřeba úprava systému.

- **Jazyk webu** – Web je pouze v češtině. Vícejazyčný provoz není v aktuální verzi podporován.

- **Role superadministrátor** – Tuto roli přiděluje pouze technický správce přímo v databázi nebo systémovém nastavení. Nelze ji nastavit přes administraci.

- **Nahrané soubory nejsou automaticky zálohovány** – Systém sám nezálohuje nahrané obrázky. Je nutné zajistit zálohu externě.

---

## 11. Nutné ověřit

Následující informace nebylo možné z kódu systému 100% potvrdit a doporučujeme je ověřit přímo s technickým správcem:

- **Automatická záloha databáze** – Je nastavena, nebo ji musí správce spouštět ručně?
- **Monitoring dostupnosti** – Je nastaven automatický alert, pokud web přestane fungovat?
- **E-mailové notifikace** – Systém aktuálně neposílá žádné notifikační e-maily (např. při chybě přihlášení nebo nahrání souboru). Pokud je tato funkce požadována, je třeba ji doplnit.
- **Záloha nahraných obrázků** – Kde jsou obrázky zálohovány a jak často?
- **Aktualizace systému** – Jak je plánována průběžná aktualizace použitých knihoven a závislostí?

---

## Shrnutí pro předání

1. Web se skládá z **veřejné části pro návštěvníky** a **administrace (CMS)** pro správce obsahu.
2. Veškerý obsah (obchody, akce, novinky, otevírací doba, kontakty) se spravuje v administraci na adrese `/cms`.
3. Systém rozlišuje **tři role**: editor (správa obsahu), administrátor (+ správa uživatelů), superadministrátor (plný přístup).
4. Po přihlášení zůstane uživatel přihlášen **7 dní**; změna hesla okamžitě odhlásí všechna zařízení.
5. Interaktivní mapa pater je technický prvek – SVG soubory upravuje pouze vývojář, propojení s obchody se nastavuje v CMS.
6. Nahrané obrázky jsou uloženy na serveru a **musí být zálohovány zvlášť** – systém je automaticky nezálohuje.
7. Obchody, akce a novinky lze **deaktivovat bez smazání** – doporučujeme tento přístup před trvalým odstraněním záznamu.
8. Maximální velikost nahrávaného obrázku je **3 MB**; povolené formáty jsou JPG, PNG, WEBP, GIF, SVG.
9. Záloha databáze existuje jako skript, který je třeba spouštět ručně nebo naplánovat automaticky.
10. Veškerá komunikace se systémem je šifrována; hesla jsou uložena bezpečně a nelze je zobrazit v původní podobě.
