# Daily Energy Map Widget

Ein statisch hostbares Browser-Widget fuer Human-Design-nahe Tagesauswertungen: Live-Chart aus Geburtsdaten, taegliche Transite, Bodygraph, Score-Dimensionen und Penta-/Team-Ansicht.

## Was jetzt live berechnet wird

- Eingabe fuer Name, Geburtsdatum, exakte Uhrzeit und UTC-Offset
- Swiss-Ephemeris-WASM-Berechnung im Browser fuer Sonne, Mond, Merkur, Venus, Mars, Jupiter und Saturn
- Erde als exakte Opposition zur Sonne
- Design-Zeitpunkt ueber den Moment, an dem die Sonne 88 Grad vor der Geburtsposition stand
- Mapping auf das 69.120-Segment-Mandala: Gate, Line, Color, Tone und Base
- definierte Gates aus Personality- und Design-Aktivierungen
- definierte Zentren aus vollstaendigen Kanaelen

Chiron bleibt sichtbar, ist aber markiert approximiert, solange keine separate Asteroiden-Ephemeris-Datei eingebunden ist.

## Wichtig zu den Beispielprofilen

Daniel, Patrick und Paradise Ventures sind weiterhin enthalten, aber in der App als **Platzhalter-Daten** markiert. Sie dienen nur als Demo, bis echte Geburts-/Gruendungsdaten eingegeben oder hinterlegt werden.

## App bedienen

1. Im Bereich **Live-Chart berechnen** Geburtsdaten eingeben.
2. UTC-Offset exakt eintragen, z.B. `+01:00` oder `+02:00`.
   - Der Offset muss Sommerzeit am Geburtsort bereits enthalten.
   - Ohne Backend/Geocoding wird die Zeitzone nicht automatisch aus dem Ort berechnet.
3. **Chart live berechnen** klicken.
4. Danach erscheint das Live-Profil in der Profilauswahl.
5. Mit `Heute`, `Zurueck` und `Weiter` Tagesenergien ansehen.
6. Bodygraph-Tore oder Zentren anklicken, um Erklaerungen zu sehen.

## Hosting

Nach dem Merge in `main` wird die App ueber GitHub Pages gebaut und veroeffentlicht:

https://amosstrategy.github.io/trade-Strat-1/

Das Hosting ist statisch. Es braucht keinen eigenen Server und keine Datenbank.

Einbettung als Widget ist z.B. per iframe moeglich:

```html
<iframe
  src="https://amosstrategy.github.io/trade-Strat-1/"
  style="width:100%;height:900px;border:0;border-radius:20px;"
  loading="lazy"
></iframe>
```

## Entwicklung

```bash
npm install
npm run dev
npm run build
```

Der Produktionsbuild liegt danach in `dist/`.

## Deployment

Die Datei `.github/workflows/pages.yml` fuehrt auf `main` aus:

1. `npm ci`
2. `npm run build`
3. Upload von `dist/` zu GitHub Pages

Hinweis: In privaten Repositories muss GitHub Pages ggf. einmal manuell in den Repository Settings aktiviert werden.
