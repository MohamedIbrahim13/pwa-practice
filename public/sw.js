const staticCacheName = 'site-static-v12';
const dynamicCacheName = 'dynamic-v12';
const assets = [
    '/',
    '/index.html',
    'js/app.js',
    'js/ui.js',
    'js/materialize.min.js',
    'css/styles.css',
    'css/materialize.min.css',
    'img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'pages/fallback.html'
];

self.addEventListener('install', (e) => {
    //console.log('Service Worker has been installed',e);
    e.waitUntil(
        caches.open(staticCacheName).then(cache => {
            //console.log('Caching Assets');
            cache.addAll(assets);
        })
    );

});

self.addEventListener('activate', (e) => {
    //console.log('Service Worker has been activated');
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});

const limitCache = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCache(name, size));
            }
        });
    });
};

self.addEventListener('fetch', (e) => {
    if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
        e.respondWith(
            caches.match(e.request).then(cacheRes => {
                return cacheRes || fetch(e.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(e.request.url, fetchRes.clone());
                        limitCache(dynamicCacheName, 15);
                        return fetchRes;
                    })
                });
            }).catch(() => {
                if (e.request.url.indexOf('.html') > -1) {
                    return caches.match('/pages/fallback.html');
                }
            })
        );
    }

});
