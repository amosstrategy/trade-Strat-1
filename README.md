# Daily Energy Map

Eine lokale Single-File-App, die fuer Personen, Teams und die Marke Paradise Ventures taeglich beantwortet: Wann ist heute der beste Moment fuer was - und warum?

## Live-URLs (GitHub Pages)

**Landing / Readings:**

https://amosstrategy.github.io/trade-Strat-1/

**Daily Energy Map (HD-App inkl. Jung/OEJTS):**

https://amosstrategy.github.io/trade-Strat-1/app/

Nach jedem Push auf `main` deployt GitHub Actions automatisch (ca. 1–2 Min.).

> **Domain:** `CNAME` → `paradise.ventures` ist im Repo. DNS bei GoDaddy auf GitHub Pages zeigen lassen (oder Custom Domain in Repo-Settings), dann gilt die Hauptdomain.

**Wissens-/SEO-Schicht (Hintergrund, Landing/App unverändert):**

- DE: https://paradise.ventures/wissen/ (bzw. GitHub-URL + `/wissen/`)
- EN: https://paradise.ventures/en/knowledge/
- `llms.txt`, `sitemap.xml`, `robots.txt` — für KI-Suche und Google
- Rechtliches: `/impressum.html`, `/datenschutz.html`, `/haftungsausschluss.html` (+ EN)

## App bedienen

1. Profil oben waehlen (in jedem Tab).
2. HD-Chart unter **Eingabe** speichern, Jung-Test unter **Jung**.
3. **Wetter** zeigt kollektives Transit-Wetter oben und deine persoenliche Tages-Lesung unten.
4. **Dein Chart** zeigt Bodygraph und Erklaerungen zu deinem festen Design.
5. Mit `Heute`, `Zurueck` und `Weiter` durch die Tage gehen (Wetter / Penta).
6. Mit `EN` / `DE` die Sprache wechseln.
7. Im Bodygraph ein Tor oder Zentrum anklicken.
8. Im Penta-Bereich Team-Mitglieder an- oder abwaehlen.

Admin-Konsole (nur lokal): `/app/?admin=1`

## Lokal oeffnen

```bash
cd trade-Strat-1
python -m http.server 8765
```

Dann: http://localhost:8765/app/

Swiss Ephemeris laeuft im Browser — nicht per Doppelklick auf `index.html` oeffnen (`file://` blockiert WASM).

## Deployment

`.github/workflows/pages.yml` veroeffentlicht den gesamten Ordner auf GitHub Pages bei Push auf `main`.

## Enthaltene Bereiche

- Swiss Ephemeris Bodygraph (Engine v4)
- Wetter (Zeitqualitaet + persoenliche Tages-Lesung), Penta/Team, Jung/OEJTS
- Profil-Datenbank (HD + Jung pro Person, localStorage — unveraendert bei Updates)
- DE/EN-Umschaltung
