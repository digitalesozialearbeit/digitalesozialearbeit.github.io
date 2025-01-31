# Digitale Soziale Arbeit – Website Guide

## 🎯 Über dieses Dokument
In diesem Guide erfährst du, wie du Inhalte auf der Website “Digitale Soziale Arbeit” bearbeiten kannst. Es werden zwei Methoden vorgestellt:

1. **Über die GitHub-Weboberfläche (einfach)**
2. **Lokal auf deinem Computer mit VS Code (fortgeschritten)**

## 📋 Voraussetzungen
1. **GitHub-Account**
   [Hier erstellen](https://github.com/signup)
2. **Zugriff auf das Repository**
   Bitte bei [christian.steiner@dhcraft.org](mailto:christian.steiner@dhcraft.org) anfragen. Du erhältst eine Einladung per E-Mail, die du annehmen musst.
3. **Grundkenntnisse in HTML**
   Einsteiger-Tutorial: [W3Schools HTML Tutorial](https://www.w3schools.com/html/)

> **Hinweis**: Ein “HTML-Tag” ist ein Element in spitzen Klammern, z.B. `<h2>` oder `<p>`. Nur den Text zwischen diesen Tags bearbeiten, nicht die Tags selbst.

---

## 🔄 Vergleich der Methoden

### Methode 1: GitHub Web Interface

**Vorteile**
- Keine Installation notwendig
- Sofort einsatzbereit
- Einfacher Einstieg
- Gut für kleine Textänderungen
- Änderungen direkt auf GitHub sichtbar

**Nachteile**
- Keine Live-Vorschau
- Eher für kleinere Änderungen
- Code-Formatierung nicht optimal
- Kein direktes Testen möglich

### Methode 2: Lokal mit VS Code

**Vorteile**
- Live-Vorschau der Änderungen
- Bessere Code-Formatierung (z.B. mit Prettier)
- Direktes Testen möglich
- Komfortabel bei größeren Änderungen
- Bessere Übersicht über Dateien

**Nachteile**
- Installation erforderlich
- Etwas komplexere Einrichtung
- Zusätzliche PC-Kenntnisse hilfreich

**Empfehlung:**
- Für gelegentliche, kleine Textänderungen: **Methode 1**
- Für regelmäßige oder größere Änderungen: **Methode 2**

---

## 🌐 Methode 1: Über die GitHub-Weboberfläche

1. **Zur gewünschten Datei navigieren**
   Wähle die Datei aus, die du bearbeiten möchtest.
2. **Auf den Stift-Button (Edit) klicken**
   Damit gelangst du in den Bearbeitungsmodus.
3. **Änderungen vornehmen**
   Passe den Text zwischen den HTML-Tags an. Tags selbst nicht ändern.
4. **Commit vorbereiten**
   Scrolle nach unten zu “Commit changes”.
   Füge eine kurze Beschreibung deiner Änderungen hinzu.
5. **Bestätigen**
   Klicke auf “Commit changes”, um die Änderungen zu speichern.

> **Hinweis**: Änderungen über das Webinterface sind in der Regel direkt wirksam.

---

## 💻 Methode 2: Lokal mit VS Code (Fortgeschritten)

### Einmalige Einrichtung

1. **GitHub Desktop installieren**
   - [Download GitHub Desktop](https://desktop.github.com/)
   - Installation starten und mit deinem GitHub-Account anmelden

2. **VS Code installieren**
   - [Download VS Code](https://code.visualstudio.com/)
   - Installation starten
   - Erweiterungen (Extensions) installieren:
     1. VS Code öffnen
     2. Erweiterungen-Symbol (vier Quadrate) anklicken oder `STRG + SHIFT + X`
     3. Folgende Extensions suchen und installieren:
        - *Live Server* (von Ritwick Dey)
        - *Prettier – Code formatter* (von Prettier)
        - *HTML CSS Support* (von ecmel)
     4. VS Code neu starten

3. **Repository klonen**
   - GitHub Desktop öffnen
   - Auf “Clone a repository” klicken
   - Das “digitalesozialearb…” Repository auswählen
   - Lokalen Speicherort wählen
   - “Clone” klicken
   - Achte darauf, dass du die Einladung zum Repository bereits über die E-Mail akzeptiert hast.

### Lokales Arbeiten

1. **Projekt in VS Code öffnen**
   - VS Code starten
   - *File → Open Folder*
   - Den geklonten Repository-Ordner wählen
   - Projektstruktur erscheint im VS Code-Explorer

2. **Live Server starten** (um die Website lokal zu sehen)
   - *Option A*: Rechtsklick auf `index.html` → *“Open with Live Server”*
   - *Option B*: In der Statusleiste unten rechts auf *“Go Live”* klicken
   - Website öffnet sich im Browser (dieses Fenster für die Vorschau offen lassen)

3. **Änderungen vornehmen**
   - Dateien in VS Code bearbeiten
   - Mit `STRG + S` speichern
   - Vorschau im Browser wird automatisch aktualisiert
   - Änderungen ggf. rückgängig machen (`STRG + Z`)

4. **Änderungen hochladen**
   - GitHub Desktop öffnen
   - Deine Änderungen werden angezeigt (grün: hinzugefügt, rot: entfernt)
   - Eine kurze, aussagekräftige Beschreibung eingeben
   - Auf **“Commit to main”** klicken (lokales Speichern der Änderungen)
   - Anschließend **“Push origin”** klicken (Änderungen auf GitHub hochladen)

---

## ⚠️ Typische Probleme & Lösungen

1. **Live Server startet nicht**
   - Prüfen, ob die *Live Server*-Extension installiert ist
   - VS Code neu starten
   - Ggf. anderen Browser testen

2. **Änderungen nicht sichtbar**
   - Speichern (`STRG + S`)
   - Browser-Cache leeren (`STRG + F5`)
   - Live Server neu starten

3. **GitHub Desktop zeigt keine Änderungen**
   - Prüfen, ob du die Datei wirklich gespeichert hast
   - Richtigen Projektordner ausgewählt?
   - VS Code und GitHub Desktop neu starten

4. **Wo darf ich den Text ändern?**
   - Grundregel: Text zwischen den Tags ändern ist immer problemlos, z.B.:
     ```html
     <p>HIER ÄNDERN</p>
     <h2>HIER ÄNDERN</h2>
     <a href="link.html">HIER ÄNDERN</a>
     ```
   - Diese Änderungen führen zu Styling unter Feature Änderungen, nicht nur Content:
     - Alles in spitzen Klammern `<Tag>`
     - `class="..."`
     - `style="..."`
     - `data-...` Attribute

---

## ❗ Wichtige Hinweise

- **Header und Footer** (z.B. `header.html` / `footer.html`) sind global eingebunden
  → Änderungen betreffen alle Seiten.
- **Neue Komponenten**
  → Bei Fragen zu Stil und Gestaltung: [Silicon UI Kit](https://silicon.createx.studio/components/typography.html)
- **Fragen?**
  → Ansprechpartner: [christian.steiner@dhcraft.org](mailto:christian.steiner@dhcraft.org)

---

## 🆘 Hilfe & Support

1. [Bootstrap 5 Dokumentation](https://getbootstrap.com/docs/5.3)
2. [Silicon UI Kit](https://silicon.createx.studio/components/typography.html)
3. [christian.steiner@dhcraft.org](mailto:christian.steiner@dhcraft.org)

---

## 📝 Beispiele für Content-Bearbeitung



### ⚠️ Wichtig beim Bearbeiten
1. Nur den Text zwischen den HTML-Tags ändern
2. Tags und Klassen (`class="..."`) nicht verändern
3. **Bilder**
   - Neue Bilder zuerst in `assets/img` hochladen
   - Dann im Quelltext `src="assets/img/..."` anpassen
   - Möglichst PNG-Format verwenden
4. **Testing**
   - Nach jeder Änderung im Browser prüfen
5. **Rückgängig machen**
   - Mit GitHub kannst du Änderungen jederzeit zurücksetzen (in GitHub Desktop unter “History” oder direkt in GitHub)

---
