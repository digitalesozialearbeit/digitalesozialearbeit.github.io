# CLAUDE.md – digitalesozialearbeit.github.io

## Projekt
Website des Forschungsteams "Soziale Arbeit & Digitalisierung" (Uni Graz / Digital Humanities Craft).
Themen: Digitalisierung in der Sozialen Arbeit, KI, Gender & Diversität.

## Tech-Stack
- **Kein Static Site Generator** – reines HTML/CSS/JS
- **Bootstrap 5** + **Silicon UI Kit** (Createx Studio)
- **Boxicons** für Icons (`bx bx-*`)
- **LightGallery** für Medien-Galerien
- **Dark Mode** via `data-bs-theme` Attribut + localStorage

## Seitenstruktur
- Alle Seiten sind **flache HTML-Dateien im Root** (kein Ordner/index.html-Pattern)
- GitHub Pages liefert `foo.html` unter `/foo` aus (ohne .html in der URL)
- Header und Footer werden **dynamisch** per `assets/js/data-includes.js` geladen:
  - `<div data-include="header.html"></div>`
  - `<div data-include="footer.html"></div>`
- Navigation ist in `header.html`, Footer in `footer.html`

## Neue Seite anlegen
1. HTML-Datei im Root erstellen (z.B. `neue-seite.html`)
2. Boilerplate von bestehender Seite kopieren (z.B. `ai-socialwork.html`)
3. `data-include="header.html"` und `data-include="footer.html"` beibehalten
4. Relative Pfade `assets/...` funktionieren, da alle Seiten im Root liegen
5. Sitemap (`sitemap.xml`) aktualisieren – `lastmod` aus Git-History holen
6. Ggf. Navigation in `header.html` ergänzen

## Wichtige Dateien
- `header.html` – Shared Navigation (Dropdowns: Team & Projekte, Veröffentlichungen, Materialien für die Praxis, KI & Soziale Arbeit)
- `footer.html` – Shared Footer
- `assets/js/data-includes.js` – Dynamisches Laden von Header/Footer + Theme-Switcher
- `assets/css/theme.min.css` – Kompiliertes CSS (Bootstrap + Silicon Theme)
- `sitemap.xml` – Manuell gepflegt, `lastmod` aus Git-History
- `robots.txt` – Allow all + Sitemap-Verweis

## CSS-Patterns
- Cards: `card border-0 shadow-sm mb-4 p-4`
- Farbige Cards: `bg-faded-primary`, `bg-faded-warning`, `bg-faded-success`
- Layout: `container mb-5 pt-4 pb-2 py-mg-4` > `row` > `col-lg-8` (Content) + `col-lg-4` (Sidebar)
- Sticky Sidebar: `sticky-top` mit `style="top: 105px"`
- Titel: `h1 class="h2 mb-4"`, Untertitel: `h4 text-muted`

## Sprache
- Website ist **deutschsprachig**
- Gendergerechte Sprache mit Doppelpunkt (z.B. Expert:innen, Fachkräfte)
