//This is the service worker with the Advanced caching
// Nom derive du CONTENU du build, injecte par ServiceWorkerBuildPlugin.
// Il change des qu'un fichier emis change : c'est ce changement qui declenche
// l'installation d'un nouveau service worker, donc la mise a jour du cache.
const CACHE = 'cache-__BUILD_ID__';
const debug = false;

// Liste generee au build depuis les assets REELLEMENT emis (jamais a la main :
// les noms portent un contenthash et changent a chaque compilation).
const precacheFiles = __PRECACHE__;

const offlineFallbackPage = '/offline.html';

const networkFirstPaths = [
  // Les PAGES vont au reseau d'abord, le cache ne sert que de repli hors-ligne.
  // Sans ca, une nouvelle mise en ligne n'est visible qu'a la DEUXIEME visite.
  /^https?:\/\/[^/]+\/(\?.*)?$/,   // la racine
  /\.html(\?.*)?$/,                 // index, dev, chain, pro, offline, 404
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

  // Purge : tout cache dont le nom differe du CACHE courant appartient a un build
  // precedent. Sans cette etape on empile un cache complet par version livree.
  event.waitUntil(
    caches.keys()
      .then(function (noms) {
        return Promise.all(
          noms.filter(function (nom) { return nom !== CACHE; })
              .map(function (nom) {
                if (debug) console.log('[PWA Builder] Suppression du cache obsolete ' + nom);
                return caches.delete(nom);
              })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
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
        // Repli : la page en cache si on l'a, sinon la page hors-ligne pour une navigation.
        return fromCache(event.request).catch(function () {
          if (event.request.mode === 'navigate') {
            return caches.open(CACHE).then(function (cache) { return cache.match(offlineFallbackPage); });
          }
          return Response.error();
        });
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
