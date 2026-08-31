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

## 4. Produktbeschreibung: Ton wie Apple/Mercedes, nicht wie eine Feature-Liste

**Regel:** Große Marken verkaufen ein Gefühl, keine Spec-Liste. Apple sagt
nicht "hochauflösendes Display mit exzellenter Farbgenauigkeit" -- sie
sagen "Think different." Mercedes sagt nicht "perfekter Komfort für
zuhause" -- sie sagen "Das Beste oder nichts." Aber: Kunden, die etwas
Digitales von einer neuen Marke kaufen, wollen trotzdem konkret wissen,
was sie bekommen -- zu vage/blumig wirkt unseriös. Der Text muss klar
sagen "das ist das Produkt" (wie viele Bilder, welcher Stil), ohne wie
eine Feature-Checkliste mit Häkchen zu klingen. Technische Details
(Anzahl, Download, Lizenz) kommen als **eine unauffällige Fußzeile**.

**Aufbau:**
1. Ein Satz, der klar sagt, was es ist (Anzahl, Format, Stil) UND wie es
   sich anfühlt -- z. B. "Six phone wallpapers, hand-painted in a thick
   oil-on-canvas style" statt nur "Six wallpapers" oder nur ein Stimmungssatz
2. 1 Satz, der das Motiv/die Bildwelt bildhaft benennt (Bronze, Sturm,
   Nachtstadt -- je nach Set) statt "hochwertig", "perfekt", "einzigartig"
3. Optional: das Zitat aus dem Set selbst als Schlusszeile, falls eins dabei ist
4. Fußzeile: `*N wallpapers · instant download · personal use*`

**Beispiel (Odyssey-Set):**
```
ODYSSEY

Six phone wallpapers, hand-painted in a thick oil-on-canvas style --
warriors, storms, and a ship that won't turn back.

Each piece is uniquely composed and delivered in high resolution, ready
to set as your lock screen or home screen.


*6 wallpapers · instant download · personal use*
```

Jedes Set braucht eigene Bilder/Wörter passend zum Thema -- nicht diesen
Text wiederverwenden, sondern das Prinzip (kurz, bildhaft, Gefühl statt
Feature) auf das neue Thema übertragen.

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
