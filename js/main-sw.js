const OfflinePluginRuntime = require('offline-plugin/runtime');
const debug = false;

// Check compatibility for the browser we're running this in
if ("serviceWorker" in navigator) {
  if (OfflinePluginRuntime) {
    OfflinePluginRuntime.install({
      onUpdateReady: () => OfflinePluginRuntime.applyUpdate(),
      onUpdated: () => window.location.reload(),
    });
  }
  
  if (navigator.serviceWorker.controller) {
    if (debug)
      console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("sw.js", {
        scope: "/"
      })
      .then(function (reg) {
        if (debug)
          console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      })
      .catch(function (error) {
        if (debug)
          console.log('Service worker registration failed, error:', error);
      });
  }
}
