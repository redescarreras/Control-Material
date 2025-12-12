---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022008eb53d124c439e40e46e1ba95d122353a371fd292d4baaa0a84d06e797e23bf0221008a94a8b7a30a666050cb82d7e083a8102c15d7bf92e192bb3250533a1706acd1
    ReservedCode2: 304502210086ae96bde6e6b3e511109214e2a25d49a9bafaea173b2aa222a544d8d1227bd602201aab68f571f61e1f62b05c933b0a5a1b2fd26c090fdc8839e9b3bd96cad52af9
---

# Service Worker Configuration for GitHub Pages

# GitHub Pages sirve desde una ruta base que puede ser:
# - https://usuario.github.io (raíz)
# - https://usuario.github.io/repositorio (subdirectorio)

# Para que el service worker funcione correctamente en GitHub Pages,
# asegúrate de que el atributo 'scope' en manifest.json sea correcto:
# - Para sitio en raíz: "./"
# - Para sitio en subdirectorio: "/nombre-repositorio/"

# El service worker sw.js ya está configurado para funcionar en ambos casos.