---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30450220319414e79e2289f268375137d1e13a84678715500898ed5eb7f72bbeffd3cd1a02210082048a3f5794e458e66dc95a5aa74d935eab779e05008e54fb803b4172f209c6
    ReservedCode2: 304502205deb1b2121b7ca2dcdc2f0bfce6813d1d49f1555fcb88d7eb8b75d72635874920221009ce10076e8245a1b30638374619f32130d3e2173ded64ae0d2470426843af78d
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