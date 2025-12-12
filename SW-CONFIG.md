---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022039efb26d7a3ba40a8903b64e0908d25c41772036c3fa3a0bffba0c9a56eecf580221008bf8e26243335f788162e81bb8e82cfc7dd506f7e8154210e4541da150222fd9
    ReservedCode2: 3045022016cc4ac27c2e7f348f3dd3fa3da0539108aa633cd8c290f44d7399bce910b586022100f0f6978f008deffc0c12a6f2c650a6ee8e9af21122ecc223371f735dd99b5981
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