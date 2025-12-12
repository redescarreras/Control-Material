---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502207d6b7d7a52e09cef1e61324ca9bc615958d4c115473769862cbdf53bca1612c20221008bbef964b45b108219c703e29d895a04204f6bb4aaa8d8ebf7a6c753c1b62864
    ReservedCode2: 304502205e58733d77da2e3172dd1a0d48515b6d32265f3f52e9ae1d8a4493da0f648411022100d2c4e20c28f0ee431e5a076a4c527719731a15dc869a51b9fb09f411aecb6a95
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