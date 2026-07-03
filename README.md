# Daily Energy Map

Eine lokale Single-File-App, die fuer Personen, Teams und die Marke Paradise Ventures taeglich beantwortet: Wann ist heute der beste Moment fuer was - und warum?

## Live-URLs (GitHub Pages)

**Landing / Readings:**

https://amosstrategy.github.io/trade-Strat-1/

**Daily Energy Map (HD-App inkl. Jung/OEJTS):**

https://amosstrategy.github.io/trade-Strat-1/app/

Nach jedem Push auf `main` deployt GitHub Actions automatisch (ca. 1–2 Min.).

> **Hinweis:** `paradise.ventures` zeigt aktuell auf GoDaddy (alter Site-Builder) — nicht auf dieses Repo. Bis ein neuer Host steht, die GitHub-Links oben nutzen.

## App bedienen

1. Profil oben waehlen (in jedem Tab).
2. HD-Chart unter **Eingabe** speichern, Jung-Test unter **Jung / OEJTS**.
3. Mit `Heute`, `Zurueck` und `Weiter` durch die Tage gehen.
4. Mit `EN` / `DE` die Sprache wechseln.
5. Im Bodygraph ein Tor oder Zentrum anklicken.
6. Im Penta-Bereich Team-Mitglieder an- oder abwaehlen.

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
- Daily Map, Heute/Zeitqualitaet, Penta/Team, Jung/OEJTS
- Profil-Datenbank (HD + Jung pro Person, localStorage)
- DE/EN-Umschaltung
