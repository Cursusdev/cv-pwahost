//This is the service worker with the Advanced caching
const CACHE = 'cache-v0';
const debug = false;

const precacheFiles = [
  '/',
  '/index.html',
  '/dev.html',
  '/pro.html',
  '/chain.html',
  '/font/lato-v16-latin-regular.65e877e527022735c1a1bf5ae6183cf6.woff2',
  '/img/palmier-mer_800w600h.webp',
  '/assets/clock-icon.71e69e00c1d035dd5f5b508517032350.svg',
  '/assets/eye-icon.140cf09c2e747fea889e58818c6e0dc6.svg',
  '/assets/home-icon.2b426ebf32d763e83b55b8fee6cd40f1.svg',
  '/assets/QRCode_CVdev_120w.6459706b74f033afd28acede83d07b21.svg',
  '/assets/QRCode_CVpro_120w.af3ef028d6b0159e72821a49f05740f8.svg',
  '/assets/user.83c7f8d9da2cbaa0b04f211327d38086.svg',
  '/favicons/android-icon-36x36.png',
  '/favicons/android-icon-48x48.png',
  '/favicons/android-icon-72x72.png',
  '/favicons/android-icon-96x96.png',
  '/favicons/android-icon-192x192.png',
  '/favicons/android-icon-512x512.png',
  '/favicons/apple-icon-57x57.png',
  '/favicons/apple-icon-60x60.png',
  '/favicons/apple-icon-72x72.png',
  '/favicons/apple-icon-76x76.png',
  '/favicons/apple-icon-96x96.png',
  '/favicons/apple-icon-114x114.png',
  '/favicons/apple-icon-120x120.png',
  '/favicons/apple-icon-144x144.png',
  '/favicons/apple-icon-152x152.png',
  '/favicons/apple-icon-180x180.png',
  '/favicons/apple-icon-precomposed.png',
  '/favicons/apple-icon.png',
  '/favicons/apple-touch-icon-ipad.png',
  '/favicons/apple-touch-icon-iphone4.png',
  '/favicons/favicon-16x16.png',
  '/favicons/favicon-32x32.png',
  '/favicons/favicon-96x96.png',
  '/favicons/ms-icon-70x70.png',
  '/favicons/ms-icon-144x144.png',
  '/favicons/ms-icon-150x150.png',
  '/favicons/ms-icon-310x310.png',
  '/favicons/safari-pinned-tab.svg',
  '/offline.html',
  '/404.html',
  '/criticalJS.c6af50fdc529559dab9f.js',
  '/runtime.78a5b5084c00b620004f.js',
  '/main.544ff4d28287f5741800.js',
  '/main.6499f28f9e26005893f7.css',
  '/android-icon-144x144.png',
  '/apple-touch-icon.png',
  '/browserconfig.xml',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js'
];

const offlineFallbackPage = '/offline.html';

const networkFirstPaths = [
  /* Add an array of regex of paths that should go network first */
  // Example: /\/api\/.*/
];

const avoidCachingPaths = [
  /* Add an array of regex of paths that shouldn't be cached */
  // Example: /\/api\/.*/
];

function pathComparer(requestUrl, pathRegEx) {
  return requestUrl.match(new RegExp(pathRegEx));
}

function comparePaths(requestUrl, pathsArray) {
  if (requestUrl) {
    for (let index = 0; index < pathsArray.length; index++) {
      const pathRegEx = pathsArray[index];
      if (pathComparer(requestUrl, pathRegEx)) {
        return true;
      }
    }
  }

  return false;
}

self.addEventListener('install', function (event) {
  if (debug)
    console.log('[PWA Builder] Install Event processing');
  if (debug)
    console.log('[PWA Builder] Skip waiting on install');

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      if (debug) 
        console.log('[PWA Builder] Caching pages during install');

      return cache.addAll(precacheFiles).then(function () {
        if (offlineFallbackPage === 'offline.html') {
          return cache.add(new Response('', { status: 503, statusText: 'Service Unavailable' }));
        }

        return cache.add(offlineFallbackPage);
      });
    })
  );
});

// Allow sw to control of current page
self.addEventListener('activate', function (event) {
  if (debug)
    console.log('[PWA Builder] Claiming clients for current page');
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener('fetch', function (event) {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin')
    return
  if (event.request.method !== 'GET')
    return;

  if (comparePaths(event.request.url, networkFirstPaths)) {
    networkFirstFetch(event);
  } else {
    cacheFirstFetch(event);
  }
});


function cacheFirstFetch(event) {
  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry
        event.waitUntil(
          caches.match(event.request)
            .then(function (response) {
              return updateCache(event.request, response);
            })
        );

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view

        
        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            // The following validates that the request was for a navigation to a new document
            if (event.request.destination !== 'document' || event.request.mode !== 'navigate') {
              return;
            }

            if (debug)
              console.log('[PWA Builder] Network request failed and no cache.' + error);
            // Use the precached offline page as fallback
            return caches.open(CACHE).then(function (cache) {
              cache.match(offlineFallbackPage);
            });
          });
      }
    )
  );
}

function networkFirstFetch(event) {
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));
        return response;
      })
      .catch(function (error) {
        if (debug)
          console.log('[PWA Builder] Network request Failed. Serving content from cache: ' + error);
        return fromCache(event.request);
      })
  );
}

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject('no-match');
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  if (!comparePaths(request.url, avoidCachingPaths)) {
    return caches.open(CACHE).then(function (cache) {
      if (request.url.match("^(http|https)://")){
        cache.put(request, response);
      } else {
        return;
      }
    });
  }

  return Promise.resolve();
}
