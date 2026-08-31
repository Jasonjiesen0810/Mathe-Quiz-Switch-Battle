# Luxury Wallpaper Generator

Gibst du ein Stichwort ein (z. B. `rolex blau`), bekommst du 5-6 fertige
Handy-Wallpaper im "gemalten" Luxury-Stil (Impasto-Ölfarbe, sichtbare
Pinselstriche, Licht/Schatten-Kontrast) als JPG-Dateien.

## Setup (einmalig)

1. Python-Pakete installieren:
   ```bash
   cd generator
   pip install -r requirements.txt
   ```
2. Leonardo.ai Account erstellen: https://app.leonardo.ai
3. Im Dashboard oben auf **API Access** klicken -> API-Key erzeugen.
   Du bekommst automatisch $5 Gratis-API-Guthaben zum Testen.
4. `.env.example` nach `.env` kopieren und den Key eintragen:
   ```bash
   cp .env.example .env
   # dann LEONARDO_API_KEY=dein-key in .env eintragen
   ```

## Benutzung

```bash
python generate.py "rolex blau"
python generate.py "trading" --count 5
python generate.py "diamonds"
```

Die Bilder landen in `output/<stichwort>/`. Von dort kannst du sie direkt
für TikTok/Instagram-Videos verwenden.

## Wichtig: Kosten & Rechte

- **Kostenlos zum Testen:** Die $5 API-Startguthaben reichen für viele
  Testbilder (Kosten variieren je nach Modell/Auflösung, grob
  $0.01-0.05 pro Bild mit Alchemy).
- **Für den echten Verkauf:** Bilder, die über den kostenlosen Leonardo-Plan
  laufen, sind **öffentlich sichtbar** und andere Nutzer können sie kopieren.
  Sobald du anfängst zu verkaufen, upgrade auf mind. **Apprentice
  ($12/Monat)** für private, exklusive Bilder mit vollen Nutzungsrechten.
- **Marken/Promis:** Nutze Markennamen (z. B. "Rolex") nur als Stil-Hinweis
  im Prompt, nicht um exakte Logos zu reproduzieren. Vermeide es, echte
  Promi-Gesichter abzubilden -- rechtlich riskant beim Verkauf.

## Stil anpassen

- `style.py` -- die "Marken-DNA" (Farben, Textur, Licht). Hier änderst du
  den Look für ALLE Bilder auf einmal.
- `prompts.py` -- welche Kompositionen (Nahaufnahme, Flat-Lay, Zitat-Overlay
  usw.) pro Stichwort gebaut werden, plus die Liste der Motivations-Zitate.
- `.env` -> `LEONARDO_MODEL_ID` -- welches KI-Modell genutzt wird. Für einen
  noch stärkeren Ölgemälde-Look: in Leonardo unter "Finetuned Models" nach
  "oil painting" suchen und die Modell-ID hier eintragen.

## Bekannte Stichwort-Kategorien

`prompts.py` erkennt automatisch Themen wie `rolex`/`uhr`, `auto`, `diamant`,
`geld`, `trading`, `poker`, `marke` sowie Farben (`blau`, `gold`, `schwarz`, ...).
Unbekannte Stichwörter werden trotzdem verarbeitet, nutzen aber generischere
Prompts. Neue Kategorien einfach in `CATEGORIES` in `prompts.py` ergänzen.
