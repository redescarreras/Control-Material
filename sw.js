// Service Worker para Control de Materiales - Redes Carreras S.L.
// Versión 1.0

const CACHE_NAME = 'control-materiales-v1.0.0';
const urlsToCache = [
    'index.html',
    'styles.css',
    'app.js',
    'manifest.json',
    'logo-redes_Transparente-216x216.png',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Service Worker: Cacheando archivos...');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('❌ Service Worker: Error en instalación', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('✅ Service Worker: Activación completada');
            return self.clients.claim();
        })
    );
});

// Intercepción de requests (Fetch)
self.addEventListener('fetch', function(event) {
    // Solo interceptar requests HTTP/HTTPS
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Si encontramos el recurso en cache, lo devolvemos
                if (response) {
                    console.log('📦 Servido desde cache:', event.request.url);
                    return response;
                }
                
                // Si no está en cache, lo solicitamos de la red
                console.log('🌐 Solicitando desde red:', event.request.url);
                return fetch(event.request).then(function(response) {
                    // Verificar que sea una respuesta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar la respuesta para el cache
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(function(error) {
                    console.error('❌ Error en fetch:', error);
                    
                    // Si es una navegación, devolver la página principal
                    if (event.request.mode === 'navigate') {
                        return caches.match('index.html');
                    }
                    
                    // Para otros tipos de request, devolver error
                    throw error;
                });
            })
    );
});

// Manejo de mensajes del cliente
self.addEventListener('message', function(event) {
    console.log('📨 Service Worker: Mensaje recibido', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('🔄 Service Worker: Forzando actualización...');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        console.log('ℹ️ Service Worker: Enviando versión...');
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🧹 Service Worker: Limpiando cache...');
        caches.delete(CACHE_NAME).then(function() {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Notificación de actualización disponible
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Verificar si hay actualizaciones disponibles
        self.registration.update().then(function() {
            console.log('🔄 Service Worker: Verificación de actualización completada');
        });
    }
});

console.log('🔧 Service Worker cargado correctamente');