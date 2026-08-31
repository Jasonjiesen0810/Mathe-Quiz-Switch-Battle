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

## 4. Produktbeschreibung-Template

```
[STICHWORT] -- Luxury Wallpaper Pack

6 handgemalte Wallpaper im exklusiven Impasto-Öl-Stil. Kein generischer
Stock-Kram -- jedes Bild ist einzigartig komponiert, mit sichtbaren
Pinselstrichen und dramatischem Licht.

✓ 6 hochauflösende Wallpaper (optimiert für dein Handy-Display)
✓ Sofortiger Download nach Kauf
✓ Für persönlichen Gebrauch -- Weiterverkauf nicht erlaubt (siehe license.txt)

Perfekt für alle, die ihr Home Screen auf das nächste Level bringen wollen.
```

Pass den Titel/Text an das jeweilige Thema an (z. B. "ROLEX BLAU" oder
"TRADING MINDSET").

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
