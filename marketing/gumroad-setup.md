# Gumroad Setup Guide

## 1. Account erstellen

1. Auf https://gumroad.com registrieren (E-Mail reicht zum Start).
2. Unter **Settings -> Payments** deine Auszahlungsmethode hinterlegen
   (Bank/PayPal/Stripe, je nach Land verfügbar). Ohne das kannst du zwar
   Produkte anlegen, aber kein Geld auszahlen lassen.
3. Profilname/Handle wählen -- nutze deinen Marken-/TikTok-Namen, damit
   Käufer den Link sofort mit deinem Content verbinden (Wiedererkennung
   = Vertrauen).

## 2. Erstes Produkt anlegen

1. **New Product -> Digital Product**
2. Preis: siehe Preis-Strategie unten
3. Datei hochladen: das ZIP aus `python package_for_gumroad.py "<stichwort>"`
   (liegt in `generator/output/<stichwort>/<stichwort>-wallpaper-pack.zip`)
4. Cover-Bild: nimm das stärkste der 6 generierten Bilder (meist das
   Zitat-Overlay-Bild funktioniert am besten als Thumbnail)
5. Produktbeschreibung: siehe Template unten
6. **Content -> "Automatically deliver"** ist bei Gumroad Standard --
   Käufer bekommt den Download-Link direkt nach Zahlung, kein manueller
   Versand nötig.

## 3. Preis-Strategie

Generische Wallpaper-Packs auf Gumroad verkaufen sich oft für $2-3
(60+ Bilder, Massenware). Das willst du NICHT -- deine Marke ist Premium/
Luxury, also Preise, die zur Positionierung passen statt zum Race-to-
the-bottom:

| Produkt | Empfohlener Preis | Warum |
|---|---|---|
| Einzelnes Wallpaper | $1,50 - $2 | Niedrige Einstiegshürde für Impulskäufe direkt aus TikTok |
| 6er-Set (ein `generate.py`-Lauf) | $4,50 - $6 | Dein Standard-Produkt, guter Wert pro Bild |
| "Vault"-Bundle (mehrere Themen kombiniert, z. B. Uhren + Trading + Zitate) | $9 - $14 | Für Fans, die mehr wollen -- höherer Warenkorbwert |
| Monatliches Abo ("neue Wallpaper jeden Monat") | $3-5/Monat | Später, wenn du wiederkehrende Käufer hast (Gumroad unterstützt Subscriptions) |

Starte mit dem 6er-Set als Hauptprodukt. Einzelbilder und Bundles kannst
du ergänzen, sobald du siehst, was sich verkauft.

## 4. Produktbeschreibung: Stimmung oben, klare Fakten unten

**Regel:** Ein reiner Stimmungstext wirkt bei einer neuen/unbekannten
Marke schnell vage oder unseriös -- Käufer wollen bei einem digitalen
Produkt genau wissen, was sie bekommen (Anzahl, Auflösung, Lizenz). Ein
reiner Feature-Bullet-Text ohne Stimmung wirkt dagegen langweilig/generisch.
Das bewährte Format (bestätigt an einem real erfolgreichen Konkurrenz-
Listing) kombiniert beides: ein kurzer Stimmungsabsatz oben, dann klare
Fakten in zwei Listen darunter.

**Aufbau:**
1. **Titel in Großbuchstaben** (+ Format, falls relevant, z. B.
   "-- DESKTOP WALLPAPER COLLECTION")
2. **1-2 Sätze Stimmungsabsatz**: was es ist UND wie es sich anfühlt --
   bildhaft (Bronze, Sturm, Nachtstadt -- je nach Set), keine leeren
   Worte wie "hochwertig", "perfekt", "einzigartig"
3. **"WHAT'S INCLUDED:"** -- Bullet-Liste mit konkreten Fakten: Anzahl
   Bilder, Auflösung/Format, Themen, Download-Art, Lizenz (siehe
   `license.txt` -- aktuell **nur persönlicher Gebrauch**, kommerzielle
   Nutzung ist eine bewusste, separate Preis-/Rechte-Entscheidung, nicht
   automatisch mit reinschreiben)
4. **"PERFECT FOR:"** -- Bullet-Liste mit Anwendungsfällen/Zielgruppe
5. Optional: eine kursive Schlussnotiz, die Qualität/Sorgfalt unterstreicht
   (z. B. "no generic AI-art look") -- kein Zitat aus dem Set nötig, kann
   aber ergänzt werden, falls eins dabei ist

**Beispiel (Odyssey-Set):**
```
ODYSSEY -- DESKTOP WALLPAPER COLLECTION

Bring the tension and grandeur of ancient myth to your screen. This
collection channels raw, storm-lit Greek mythology -- every piece painted
entirely in thick, textured oil on canvas.

WHAT'S INCLUDED:
- 6 unique desktop wallpapers
- 16:9 widescreen, high resolution
- Themes: bronze-armored warriors, storm-battered ships, weapons of war
- Instant download after purchase
- Personal use license (see included license.txt)

PERFECT FOR:
- Desktop and laptop wallpaper setups
- Anyone who wants their screen to feel like a scene from an epic, not a
  stock photo
- Fans of mythology, dark academia, and painterly aesthetics

Note: Each piece is individually composed -- no filters, no repeats, no
generic "AI art" look.
```

Jedes Set braucht eigene Bilder/Wörter passend zum Thema -- Aufbau
übernehmen, Inhalt neu schreiben.

## 5. Link zu TikTok/Instagram

- Gumroad-Produktlink in die Bio setzen (oder Linktree/Beacons, falls du
  mehrere Produkte gleichzeitig zeigen willst).
- In jedem Video kurz "Link in Bio" erwähnen/einblenden, wenn ein neues
  Wallpaper-Set gezeigt wird.
- Der `marketing-agent` (`.claude/agents/marketing-agent.md`) hilft dir
  bei Captions/Hooks, die auf den Kauf hinweisen, ohne aufdringlich zu
  wirken.

## 6. Kompletter Workflow pro neuem Set

```bash
cd generator
python generate.py "rolex blau"              # Bilder generieren
python package_for_gumroad.py "rolex blau"    # ZIP fürs Hochladen bauen
```

Dann: ZIP + Cover-Bild in ein neues Gumroad-Produkt hochladen, Produktlink
für den nächsten TikTok/Instagram-Post nutzen.
