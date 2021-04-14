//This is the service worker with the Advanced caching
const CACHE = 'cache-v3';
const debug = false;

const precacheFiles = [
  '/',
  '/index.html',
  '/dev.html',
  '/pro.html',
  // '/font/lato-v16-latin-regular.b4d2c4c39853ee244272c04999b230ba.woff2',
  // '/img/palmier-mer_700w525h.355efaa7bfe5cd8219eb2f1844400dad.jpg',
  // '/assets/click-icon.590a69cf32789dee9ff6c9693fa526f0.svg',
  // '/assets/download-icon.c2b30e649451969e692be021955718bd.svg',
  // '/assets/eye-icon.8e677bc44836b1e48e0a6671f3c5d9bc.svg',
  // '/assets/home-icon.7a84d000c0f0a85179489ba9200e32b6.svg',
  // '/assets/QRCode_CVdev_120w.c99c54fcdeaae55101ceab4fd4e59461.svg',
  // '/assets/QRCode_CVpro_120w.6ff9a0d0704c3dcfc18d7d80137d0690.svg',
  // '/assets/user.0d139b2408357d6d44a7f683b1991fc5.svg',
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
  '/favicons/apple-icon.png',
  '/favicons/apple-icon-precomposed.png',
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
  '/android-icon-144x144.png',
  '/apple-touch-icon.png',
  '/browserconfig.xml',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js'
];

const offlineFallbackPage = './offline.html';

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
        if (offlineFallbackPage === 'fallback.html') {
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

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

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
      return cache.put(request, response);
    });
  }

  return Promise.resolve();
}
