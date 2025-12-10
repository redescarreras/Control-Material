# Service Worker Configuration for GitHub Pages

# GitHub Pages sirve desde una ruta base que puede ser:
# - https://usuario.github.io (raíz)
# - https://usuario.github.io/repositorio (subdirectorio)

# Para que el service worker funcione correctamente en GitHub Pages,
# asegúrate de que el atributo 'scope' en manifest.json sea correcto:
# - Para sitio en raíz: "./"
# - Para sitio en subdirectorio: "/nombre-repositorio/"

# El service worker sw.js ya está configurado para funcionar en ambos casos.