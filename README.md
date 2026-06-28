# Daily Energy Map

Eine lokale Single-File-App, die fuer Personen, Teams und die Marke Paradise Ventures taeglich beantwortet: Wann ist heute der beste Moment fuer was - und warum?

## App oeffnen

Nach dem Merge in `main` wird die App automatisch ueber GitHub Pages veroeffentlicht:

https://amosstrategy.github.io/trade-Strat-1/

**Landing page (readings & about):**

https://amosstrategy.github.io/trade-Strat-1/landing.html

Du brauchst dann nichts zu installieren und keinen Code zu oeffnen. Einfach den Link im Browser aufrufen.

## App bedienen

1. Profil auswaehlen: Daniel, Patrick oder Paradise Ventures.
2. Mit `Heute`, `Zurueck` und `Weiter` durch die Tage gehen.
3. Mit `EN` / `DE` die Sprache wechseln.
4. Im Bodygraph ein Tor oder Zentrum anklicken, um die Erklaerung zu sehen.
5. Im Penta-Bereich Team-Mitglieder an- oder abwaehlen.

## Falls der Live-Link noch nicht aktiv ist

Der Link funktioniert erst, nachdem der Pull Request gemerged wurde und GitHub Pages einmal durchgelaufen ist. Bis dahin gibt es zwei einfache Alternativen:

1. In GitHub die Datei `index.html` herunterladen.
2. Die heruntergeladene Datei doppelklicken.

Die App oeffnet sich dann lokal im Browser.

Die App laeuft komplett offline: kein Server, kein Backend, keine Datenbank, keine externen Libraries und kein Build-Step.

## Deployment

Die Datei `.github/workflows/pages.yml` veroeffentlicht die App automatisch auf GitHub Pages, sobald Aenderungen auf `main` landen. Die Website besteht nur aus der Datei `index.html`.

## Enthaltene Bereiche

- lineare Transit-Berechnung fuer Sonne, Erde, Mond, Merkur, Venus, Mars, Jupiter, Saturn und Chiron
- vollstaendiges 69.120-Segment-Mandala auf Gate-, Line-, Color-, Tone- und Base-Ebene
- 6 Scores: Energie, Intuition, Ausdruck, Klarheit, Flow und Ernaehrung
- programmatisch gezeichneter SVG-Bodygraph mit interaktiven Gates und Zentren
- DE/EN-Umschaltung ueber Bilingual-Textbausteine
- dynamische Penta-/Team-Engine fuer Daniel, Patrick und Paradise Ventures
