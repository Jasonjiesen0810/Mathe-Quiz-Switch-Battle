# Luxury Wallpaper Business -- Automatisierter Generator

Ziel: Ein Stichwort eingeben (z. B. `rolex blau`), automatisiert 5-6
Handy-Wallpaper im gemalten Impasto-Luxury-Stil bekommen (Öl-Textur,
sichtbare Pinselstriche, dramatisches Licht/Schatten -- siehe Referenz:
"Rich Life"-Zitate auf Vintage-Zeitungspapier, Poker/Trading/Diamanten-Szenen),
und diese für TikTok/Instagram-Content nutzen, um Kunden zu gewinnen.

## Aufbau

- **`generator/`** -- das eigentliche Python-Tool. Nimmt ein Stichwort,
  baut daraus 5-6 unterschiedliche Prompts (Nahaufnahme, Flat-Lay,
  Hand-Komposition, atmosphärische Szene, Zitat-Overlay) und lässt sie
  über die Leonardo.ai API generieren. Siehe `generator/README.md` für
  Setup (Leonardo-Account, API-Key, Kosten).
- **`.claude/agents/developer-agent.md`** -- Claude Code Subagent, der den
  Generator baut/pflegt (neue Kategorien, Stil-Tuning, Bugfixes).
- **`.claude/agents/marketing-agent.md`** -- Claude Code Subagent für
  TikTok/Instagram-Marketing (Captions, Hashtags, Posting-Ideen) rund um
  die generierten Wallpaper.

## Workflow

1. `cd generator && python generate.py "rolex blau"` -> Bilder landen in
   `generator/output/rolex-blau/`.
2. Bilder in ein TikTok/Instagram-Video einbauen (Wallpaper-Wechsel-Trend
   o. ä.) und hochladen -- den marketing-agent für Captions/Hashtags fragen.
3. Neue Stichworte/Kategorien? -> developer-agent fragen, `CATEGORIES` in
   `generator/prompts.py` erweitern.

## Aktueller Stand / nächste Schritte

- [x] Prompt-System mit Marken-Stil-DNA
- [x] Leonardo.ai API-Anbindung
- [x] Developer- & Marketing-Subagent
- [ ] Leonardo-Account + API-Key einrichten (User)
- [ ] Erste Testbilder generieren und Stil verfeinern
- [ ] Ggf. spezielles "oil painting" Finetuned-Model in Leonardo suchen
      und in `.env` eintragen für noch stärkeren gemalten Look
