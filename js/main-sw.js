// Check compatibility for the browser we're running this in
if ("serviceWorker" in navigator) {
  // Register the service worker
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (reg) {
      console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
    })
    .catch(function (error) {
      console.log('Service worker registration failed, error:', error);
    });
}
