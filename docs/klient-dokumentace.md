# OC Plaza Liberec - klientská dokumentace webového systému

*Verze dokumentu: květen 2026*

---

## 1. Účel dokumentu

Tento dokument popisuje webový systém OC Plaza Liberec z pohledu provozovatele a běžného správce obsahu. Je určen pro předání klientovi po spuštění webu, aby bylo jasné:

- co web návštěvníkům nabízí,
- co lze upravovat v administraci,
- jaké role a odpovědnosti mají správci,
- jak funguje publikace obsahu,
- co je potřeba hlídat při běžném provozu,
- co je potřeba řešit s technickým správcem.

Dokument je psaný provozně a businessově. Technické detaily jsou záměrně omezené na informace důležité pro správu webu.

---

## 2. Přehled systému

Web se skládá ze dvou částí:

| Část | Adresa | Popis |
|---|---|---|
| Veřejný web | `https://ocplazaliberec.cz` | Web pro návštěvníky centra |
| Administrace CMS | `https://ocplazaliberec.cz/cms` | Interní správa obsahu |

Veřejný web zobrazuje návštěvníkům obchody, akce, novinky, otevírací dobu, mapu centra, parkování, kontakty a služby.

Administrace slouží k průběžné správě obsahu bez zásahu vývojáře. Přístup mají pouze oprávnění uživatelé s vlastním účtem.

---

## 3. Veřejný web

### Hlavní stránka `/`

Hlavní stránka je vstupní rozcestník webu. Obsahuje:

- hlavní hero obrázek,
- základní přehled informací o centru,
- novinky centra,
- nadcházející akce obchodů,
- vybrané obchody,
- interaktivní mapu centra.

Obsah hlavní stránky se skládá z dat spravovaných v CMS: obchody, akce, novinky, služby, otevírací doba a nastavení hero obrázku.

### Obchody `/obchody`

Stránka obchodů zobrazuje aktivní obchody v přehledových kartách. Návštěvník může:

- vyhledávat obchod podle názvu,
- filtrovat obchody podle kategorie,
- otevřít detail konkrétního obchodu,
- přejít na interaktivní mapu.

Na veřejném webu se zobrazují pouze aktivní obchody. Obchod s budoucím datem otevření se v přehledu zobrazuje jako "Otevíráme" a karta není běžně proklikávací.

### Detail obchodu `/obchody/nazev-obchodu`

Detail obchodu obsahuje:

- logo obchodu,
- fotogalerii,
- stav otevřeno/zavřeno podle aktuální otevírací doby,
- běžnou otevírací dobu,
- dnešní speciální otevírací dobu, pokud je nastavena,
- web, e-mail a telefon,
- odkazy na Facebook a Instagram, pokud jsou vyplněné,
- textový popis,
- akce navázané na daný obchod,
- mapu s vyznačením jednotky nebo jednotek obchodu,
- související obchody podle kategorie.

### Interaktivní mapa `/mapa`

Mapa zobrazuje jednotlivá patra centra. Návštěvník může:

- přepínat patra,
- přibližovat a posouvat mapu,
- vyhledávat obchod v mapě,
- kliknout na obsazenou jednotku a přejít na detail obchodu,
- vidět prázdné, obsazené a připravované jednotky.

Mapa vychází z SVG podkladů jednotlivých pater. Tyto SVG podklady jsou technická část webu. Správce v CMS může přiřazovat obchody k jednotkám a označovat soukromě obsazené jednotky, ale samotnou grafiku SVG mapy upravuje pouze technický správce nebo superadministrátor.

### Akce `/akce`

Stránka akcí zobrazuje aktivní a neexpirované akce. Akce jsou navázané na konkrétní obchod. Pokud má akce vyplněný detailní obsah, otevře se po kliknutí v modálním okně. Pokud detailní obsah nemá, zobrazuje se pouze jako karta s obrázkem a obchodem.

Akce může mít nastavené datum "zobrazovat do". Po uplynutí tohoto data se na veřejném webu automaticky skryje, ale v CMS zůstává pro další úpravy nebo opětovné použití.

### O nás `/o-nas`

Stránka O nás sdružuje obecné informace o centru:

- název a krátký úvodní text,
- fotogalerii,
- sekci parkování,
- kontaktní osoby,
- hlavní text o centru,
- otevírací dobu centra,
- speciální otevírací dobu,
- odkazy na sociální sítě,
- služby centra,
- mapu a informace, jak se do centra dostat.

### Cookies `/cookies`

Stránka popisuje používání cookies a umožňuje návštěvníkovi znovu otevřít nastavení cookies.

Na webu je použita cookie lišta Silktide Cookie Manager. Google Tag Manager je načítán s Google Consent Mode v2. Před souhlasem jsou analytické a reklamní souhlasy nastavené jako zamítnuté.

---

## 4. Administrace CMS

Administrace je dostupná na adrese:

```text
https://ocplazaliberec.cz/cms/login
```

Přihlašuje se e-mailem a heslem. Každý správce má mít vlastní účet. Sdílení jednoho účtu mezi více lidmi se nedoporučuje.

Po přihlášení správce vidí CMS menu:

- Dashboard,
- Hlavní stránka,
- Kategorie,
- Obchody,
- Patra,
- Mapa,
- Akce,
- Novinky,
- Služby,
- O nás,
- Parkování,
- Kontakty,
- Správci,
- Můj účet,
- Odhlášení.

Položka Správci se zobrazuje pouze uživatelům s rolí administrátor nebo superadministrátor.

---

## 5. Role a oprávnění

Systém používá tři role.

| Role | Určení | Hlavní oprávnění |
|---|---|---|
| Editor | Běžný správce obsahu | Správa obsahu bez správy uživatelů |
| Administrátor | Vedoucí správy webu | Správa obsahu a správa běžných správců |
| Superadministrátor | Technický nebo hlavní správce | Plný přístup včetně technických mapových podkladů |

### Editor

Editor může spravovat obsah webu:

- obchody,
- akce,
- novinky,
- služby,
- kategorie,
- patra,
- hlavní stránku,
- O nás,
- parkování,
- kontakty,
- přiřazení obchodů v mapě,
- nahrávání obrázků.

Editor nemůže spravovat uživatelské účty. Editor také nemůže mazat vybrané typy obsahu, pokud je mazání omezené na administrátora.

### Administrátor

Administrátor může spravovat obsah stejně jako editor a navíc:

- vytvářet účty editorů a administrátorů,
- upravovat účty editorů a administrátorů,
- mazat účty kromě vlastního účtu,
- mazat obsah, kde je mazání omezené na administrátora.

Administrátor nemůže vytvořit, upravit ani smazat superadministrátora.

### Superadministrátor

Superadministrátor má nejvyšší oprávnění. Navíc může:

- vytvářet a spravovat superadministrátory,
- nahrávat a měnit SVG mapové podklady pater,
- nahrávat a měnit statickou mapu okolí centra.

Tato role by měla být svěřena pouze technicky odpovědné osobě.

---

## 6. Správa obsahu

### Obchody

Obchod je základní položka webu. V CMS se u obchodu spravuje:

- název,
- URL slug,
- krátký popis,
- dlouhý formátovaný popis,
- logo,
- fotogalerie,
- telefon,
- e-mail,
- web,
- Facebook a Instagram,
- kategorie,
- patro nebo více pater,
- jednotka nebo více jednotek na mapě,
- běžná otevírací doba,
- speciální otevírací doba,
- stav aktivní/neaktivní,
- datum budoucího otevření,
- SEO titulek a SEO popis.

Neaktivní obchod se nezobrazuje na veřejném webu ani v mapě jako veřejný obchod.

Datum budoucího otevření slouží k označení připravovaného obchodu. Takový obchod může být aktivní, ale na kartách a v mapě se zobrazuje jako připravovaný nebo "Otevíráme".

Obchod může být přiřazen k více patrům a více jednotkám. To je důležité pro velké prodejny nebo provozy zasahující do více částí centra.

### Kategorie

Kategorie slouží k třídění obchodů. Kategorie mají vlastní pořadí, aktivní/neaktivní stav a automaticky počítaný počet aktivních obchodů.

Na veřejném webu se ve filtrech běžně zobrazují aktivní kategorie, které mají alespoň jeden aktivní obchod.

### Akce

Akce jsou navázané na konkrétní obchod. Každá akce obsahuje:

- interní název,
- obrázek,
- obchod,
- volitelný detailní obsah,
- stav aktivní/neaktivní,
- pořadí,
- datum "zobrazovat do".

Datum "zobrazovat do" určuje, kdy se akce automaticky přestane zobrazovat na veřejném webu. V CMS však zůstane.

### Novinky

Novinky jsou obecné zprávy centra bez vazby na konkrétní obchod. Obsahují:

- interní název,
- obrázek,
- volitelný detailní obsah,
- stav aktivní/neaktivní,
- pořadí,
- datum "zobrazovat do".

Na hlavní stránce se zobrazují aktivní a neexpirované novinky.

### Služby

Služby popisují vybavení a služby centra pro návštěvníky. Každá služba má:

- ikonu,
- krátký popisek,
- volitelný detailní popis,
- stav aktivní/neaktivní,
- pořadí.

Služby se zobrazují na stránce O nás. Pokud mají detailní popis, lze je otevřít v modálním okně.

### Hlavní stránka

V CMS se pro hlavní stránku spravuje:

- hero obrázek,
- přepínač dekorativního rámečku okolo hero obrázku.

Další části hlavní stránky se skládají automaticky z obchodů, akcí, novinek, mapy a obecných informací.

### O nás

Sekce O nás je součástí společných obecných informací. Spravuje se:

- nadpis,
- krátký úvodní text,
- hlavní formátovaný text,
- galerie obrázků,
- sociální sítě centra.

### Kontakty

V kontaktech lze spravovat kontaktní osoby. Jeden kontakt může obsahovat:

- název nebo funkci,
- jméno,
- telefon,
- e-mail.

Maximum je 30 kontaktů z důvodu přehlednosti, rychlosti webu a responzivity.

### Parkování

Sekce parkování obsahuje:

- hlavní text o parkování,
- obrázek parkování,
- doplňující formátované informace, například ceník.

Pokud není obrázek parkování vyplněn, web použije výchozí obrázek.

### Patra

Patra slouží pro členění mapy. U patra se spravuje:

- název,
- číselná úroveň patra,
- aktivní/neaktivní stav,
- pořadí,
- SVG mapa patra,
- soukromě obsazené jednotky.

Nahrávání nebo mazání SVG mapy patra je dostupné pouze SuperAdministrátorovi.

### Mapa

Sekce mapa v CMS umožňuje:

- vidět počet všech jednotek,
- vidět obsazené a prázdné jednotky,
- vidět procento obsazenosti,
- přepínat patra,
- kliknout na jednotku,
- přiřadit jednotku obchodu,
- odebrat obchod z jednotky,
- označit jednotku jako soukromě obsazenou,
- označit jednotku zpět jako prázdnou,
- exportovat mapu patra jako samostatné SVG.

Mapa rozlišuje běžně obsazené jednotky, soukromě obsazené jednotky, připravované obchody a prázdné jednotky.

---

## 7. Nahrávání obrázků a souborů

V CMS lze nahrávat obrázky pro obchody, galerie, akce, novinky, služby a mapové podklady.

| Vlastnost | Hodnota |
|---|---|
| Povolené formáty | JPG, JPEG, PNG, WEBP, GIF, SVG |
| Maximální velikost jednoho souboru | 3 MB |
| Výsledná URL | `/api/uploads/<nazev-souboru>` |
| Ukládání v produkci | serverová složka pro uploads |

Doporučení:

- fotografie používat ideálně ve formátu WEBP nebo optimalizovaném JPG,
- loga a ikony používat jako SVG nebo optimalizované PNG,
- nenahrávat zbytečně velké obrázky.

---

## 8. Formátovaný text

Dlouhé texty se upravují přes vizuální editor. Správce nemusí znát HTML.

Editor podporuje běžné formátování:

- odstavce,
- nadpisy,
- tučné a kurzívu,
- podtržení,
- odrážky a číslované seznamy,
- odkazy,
- obrázky,
- zarovnání textu,
- tabulky.

Texty z editoru se na veřejném webu čistí proti nebezpečnému kódu. Přesto doporučujeme vkládat pouze obsah z důvěryhodných zdrojů a nekopírovat do CMS neznámé skripty nebo embed kódy.

---

## 9. Přihlášení a bezpečnost

### Přihlášení

Přihlášení probíhá e-mailem a heslem. Po přihlášení systém nastaví bezpečné cookies. Běžná platnost přihlášení je 7 dní.

### Více zařízení

Jeden uživatel může být přihlášen na více zařízeních současně. Každé přihlášení je evidováno jako samostatná session v databázi.

### Odhlášení

Ruční odhlášení odhlásí aktuální zařízení. Systém obsahuje API pro správu více sessions, ale v běžném CMS rozhraní není samostatná stránka pro přehled aktivních zařízení.

### Změna hesla

Každý přihlášený uživatel si může změnit heslo v sekci Můj účet. Změna hesla vyžaduje znalost aktuálního hesla.

Důležité: změna hesla v aktuální implementaci automaticky neodhlašuje ostatní aktivní zařízení. Pokud vznikne podezření na kompromitovaný účet, doporučuje se účet deaktivovat nebo požádat technického správce o zneplatnění sessions.

### Ochrana proti opakovaným pokusům o přihlášení

Přihlášení je chráněno rate limitem:

- 5 pokusů za 15 minut z jedné IP adresy,
- při překročení následuje blokace na 30 minut.

Po úspěšném přihlášení se počítadlo pokusů resetuje.

### Hesla

Hesla se v systému neukládají v čitelné podobě. Ukládá se pouze bezpečný hash hesla. Ani technický správce nemůže zobrazit původní heslo.

---

## 10. Cookies a měření

Web používá:

- Google Tag Manager,
- Google Consent Mode v2,
- Silktide Cookie Manager,
- Google Maps embed na stránce O nás,
- lokální uložení volby cookies v prohlížeči návštěvníka.

Google Tag Manager se nenačítá na CMS stránkách. CMS není určeno pro měření návštěvnosti.

Ve výchozím stavu jsou analytické a reklamní souhlasy zamítnuté. Návštěvník je může povolit v cookie liště.

V kódu je aktuálně nastaven Google Tag Manager ID:

```text
GTM-WB3N3SCX
```

Pokud se používá Google Analytics, Hotjar nebo jiné měřicí nástroje, typicky se spravují uvnitř Google Tag Manageru. Přístupy k těmto službám je potřeba předat zvlášť v dokumentu `klient-pristupy.md`.

---

## 11. Provozní informace

### Hosting a infrastruktura

Systém je připraven pro běh na serveru v kontejneru. Podle projektové konfigurace se počítá s provozem na Hetzner serveru přes Coolify. Databáze je MongoDB.

Klíčové části provozu:

- webová aplikace běžící v Node.js/Nuxt,
- MongoDB databáze,
- persistentní složka pro nahrané soubory,
- doména a DNS,
- HTTPS certifikát,
- Google Tag Manager a případné navázané měřicí služby.

### Nahrané soubory

Nahrané obrázky nejsou součástí Git repozitáře ani běžného Docker obrazu. V produkci musí být uložené v persistentní složce serveru.

Při přesunu webu na jiný server je nutné přenést:

- databázi,
- nahrané obrázky,
- environment proměnné,
- doménu/DNS,
- konfiguraci deploye.

### Záloha databáze

V repozitáři existují historické zálohy databáze a dokumentace zmiňuje zálohovací skripty. Aktuální `package.json` obsahuje příkazy pro zálohu a obnovu databáze. Samotné TypeScript skripty pro backup/restore v aktuálním pracovním adresáři existují, ale nejsou verzované Gitem, protože `scripts/*.ts` je ignorováno.

To znamená, že při čistém klonu repozitáře nemusí být tyto skripty k dispozici. Automatickou nebo ruční zálohu je proto potřeba ověřit přímo na produkčním serveru/Coolify/Hetzneru.

### Health check

Aplikace obsahuje endpoint:

```text
/api/health
```

Ten kontroluje dostupnost aplikace a databáze. Používá se pro Docker health check a může se použít i pro externí monitoring.

---

## 12. Doporučený provozní režim

### Pravidelně kontrolovat

- správnost otevíracích dob centra a obchodů,
- speciální otevírací dobu před svátky,
- aktuálnost kontaktů,
- aktivní/neaktivní stav obchodů,
- datum "zobrazovat do" u akcí a novinek,
- správnost mapového přiřazení obchodů,
- funkčnost kontaktních odkazů,
- načítání obrázků.

### Po větších změnách v CMS

Po každé větší změně doporučujeme zkontrolovat veřejný web:

- hlavní stránku,
- stránku obchodů,
- detail upraveného obchodu,
- mapu,
- akce,
- O nás.

### Při odchodu zaměstnance

Pokud osoba s přístupem do CMS již nemá web spravovat:

1. Administrátor deaktivuje nebo smaže její účet.
2. Pokud osoba znala sdílené technické přístupy, je nutné změnit hesla i tam.
3. U důležitých služeb je vhodné zkontrolovat dvoufázové ověření a vlastníky účtů.

---

## 13. Omezení systému

- Web je aktuálně pouze v češtině.
- Akce musí být navázaná na konkrétní obchod.
- Novinky nemají vlastní detailní URL, zobrazují se v modálních oknech.
- Akce nemají vlastní detailní URL, zobrazují se v modálních oknech.
- Veřejný výpis obchodů filtruje podle kategorie a názvu, ne podle patra.
- Přímá grafická úprava SVG mapy není běžná práce editora.
- Nahrané soubory musí být zálohované mimo Git.
- Změna hesla uživatele v aktuální implementaci neodhlašuje ostatní zařízení.
- V běžném CMS není obrazovka pro správu aktivních sessions.
- E-mailové notifikace systém aktuálně neposílá.
- Zálohovací a obnovovací skripty zmiňované v npm příkazech je nutné ověřit na produkčním serveru, protože nejsou verzované Gitem.

---

## 14. Přístupy k projektu

Přístupy a citlivé údaje se nemají ukládat přímo do Git repozitáře.

Pro předání klientovi slouží samostatný dokument:

```text
docs/klient-pristupy.md
```

Tento soubor je přidaný do `.gitignore`, aby se omylem necommitnul. Hodnoty je potřeba doplnit ručně a klientovi předat bezpečným způsobem, například zaheslovaným souborem e-mailem a heslem přes SMS.

Dokument by měl obsahovat zejména:

- CMS účty,
- Hetzner,
- Coolify,
- GitHub/repozitář,
- MongoDB,
- doménu a DNS,
- Google Tag Manager,
- Google Analytics,
- Hotjar,
- e-mailové nebo další provozní účty,
- SSH přístupy,
- environment proměnné,
- zálohy a monitoring.

---

## 15. Shrnutí pro klienta

1. Web se spravuje přes CMS na adrese `/cms`.
2. Veřejný web zobrazuje pouze aktivní obsah a respektuje expiraci akcí a novinek.
3. Obchody lze přiřazovat do kategorií, pater a mapových jednotek.
4. Mapa je propojená s daty z CMS, ale SVG grafické podklady jsou technická část.
5. Editor spravuje obsah, administrátor navíc uživatele, superadministrátor i technické mapové části.
6. Obrázky se nahrávají na server a musí být zálohované mimo Git.
7. Databáze a uploads jsou nejdůležitější provozní data pro obnovu webu.
8. Přístupy se předávají zvlášť v neveřejném souboru `klient-pristupy.md`.
9. Před produkčním spuštěním je nutné ověřit zálohy, monitoring, doménu, DNS, HTTPS a měřicí služby.
