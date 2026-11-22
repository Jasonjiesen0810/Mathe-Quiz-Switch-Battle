# Design-Vorgabe: „Aura“-Stil

Referenz-Implementierung: `aura.html`. Wenn der Nutzer nach einer Website, Landingpage oder Animation fragt
(oder „wie Aura“ / „im gleichen Design“ sagt), diesen Stil verwenden und `aura.html` als Vorlage lesen.

## Grundidee
- Kein klassisches Website-Layout, sondern eine **scroll-gesteuerte Kamerafahrt** – Apple-Produktseiten-Gefühl.
- Ein 3D-Objekt (Three.js, `three@0.160.0` per Importmap von jsDelivr) steht fix im Raum, `position:fixed`-Canvas.
- Scrollen bewegt **die Kamera**, nicht die Seite. Die Seite ist nur eine hohe Scroll-Spur (`#track`, ca. 900vh).

## Kamera & Bewegung
- Keyframes in **Kugelkoordinaten** um ein Ziel: `{ p, r, az, el, t:[x,y,z], sx, ex, light }`.
  - `r` logarithmisch interpolieren (natürlicher Dolly), `az`/`el` linear → saubere Orbits ohne Durchflug.
  - `sx` = horizontaler Frame-Versatz über `camera.setViewOffset` (Objekt rechts/links neben dem Text).
- **Hold-Zonen** (`HOLD ≈ 0.2`) um jeden Keyframe: Kamera ruht, während der Text lesbar ist; dazwischen `easeInOutCubic`.
- **Trägheit**: `cur += (scroll - cur) * (1 - exp(-dt * 4.2))` – nie direkt an `scrollY` koppeln.
- Leichte **Maus-Parallaxe** (±3° Azimut, ±2° Elevation), sanft gedämpft.
- Dramaturgie: Hero frontal → seitlicher Orbit → extreme Nahaufnahme eines Details → Explosionsansicht
  der Bauteile mit 3D-verankerten Labels → Rückseite → voller 360°-Kreis zurück nach vorne zum Finale.
- Intro beim Laden: Objekt steigt von unten auf und dreht sich ein (easeOutQuart, ~2.6 s), Display geht danach an.
- Portrait/Mobil: Kamera weiter zurück (`r *= (0.95/aspect)^0.85`), Objekt nach oben versetzt, Text unten.

## Look
- Hintergrund schwarz mit dezentem Radialverlauf (`#141519` → `#000`), Vignette darüber.
- Materialien: gebürstetes Aluminium (metalness 1, roughness ~0.3), `RoomEnvironment`-Reflexionen,
  ACES-Tonemapping, Exposure ~1.05. Farbige Rim-Lights (Blau `#4f8cff`, Warm `#ff8a5c`),
  Key-Light wandert mit dem Scroll-Fortschritt → Reflexe gleiten über Kanten.
- Kamera-FOV 30° (wenig Verzerrung, „Produktfoto“).

## Typografie & Text
- Schrift: `-apple-system, "SF Pro Display", Inter, …`, Antialiasing an.
- Headlines: 600–700, `letter-spacing: -0.035em`, Verlauf Weiß → `#9a9aa0` als Text-Clip.
- Eyebrow über jeder Headline: Verlauf `#ff7a45 → #ff3d77 → #a35cff`.
- Fließtext `#86868b`, Hervorhebungen in `#f5f5f7`.
- Hero: riesiges Wort **hinter** dem 3D-Objekt (eigene Ebene unter dem Canvas), Untertitel davor.
- Text wird **scroll-gesteuert** Zeile für Zeile eingeblendet: opacity, translateY (±44px je nach Richtung),
  Blur bis 12px, gestaffelt pro Zeile.
- Abschnitte wechseln links/rechts, Objekt jeweils auf der Gegenseite.

## UI-Details
- Nav: 48px, schwarz 55 % + `backdrop-filter: saturate(180%) blur(20px)`, Pill-Button in `#2997ff`.
- 1px-Fortschrittslinie am Nav-Unterrand im Eyebrow-Verlauf.
- „Scrollen“-Hinweis mit laufendem Lichtstrich, verschwindet ab 1,5 % Fortschritt.
- Finale: zentrierte Headline + Pill-Buttons (primär blau, sekundär Outline), „Noch einmal ansehen“ scrollt sanft nach oben.

## Sprache
- Texte auf Deutsch, kurz und poetisch („Licht, in Form gebracht.“, „Aus einem Stück.“).
