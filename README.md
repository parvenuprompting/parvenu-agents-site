# Parvenu Agent Family — Site

De officiële site van de Parvenu Agent Family: een AI-familie die complete websites bouwt.

**Live:** https://parvenuprompting.github.io/parvenu-agents-site/

## Structuur
- `index.html` — one-page site (hero, diensten, familie, werk, werkwijze, contact)
- `css/style.css` — donker ivoor + koper, huisstijl VanLoyen-look (#b08d57)
- `.github/workflows/pages.yml` — GitHub Pages deploy (push = live)

## Regels
- Alleen relatieve paden (Pages serveert vanaf subpath)
- Geen build-stap, geen JS-dependencies
- Wijziging = commit + push naar main → live binnen ~30 sec
