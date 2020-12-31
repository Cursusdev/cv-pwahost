// Progressive Web App call
function pwa() {
  const pwaBtn = document.getElementById('pwa-btn')
  const pwaDiv = document.getElementById('pwa-div')

  if ( pwaBtn && pwaDiv) {
    let deferredPrompt;
  
    window.addEventListener('beforeinstallprompt', e => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      window.deferredPrompt = e;
      // Remove the 'hidden' class from the install button container
      pwaDiv.classList.toggle('hidden', false);
    });

    pwaBtn.addEventListener('click', e => {
      const promptEvent = window.deferredPrompt;
      if (!promptEvent) {
        // The deferred prompt isn't available.
        return;
      }
      // Show the install prompt.
      promptEvent.prompt();
      // Wait for the user to respond to the prompt
      promptEvent.userChoice.then((result) => {
        // Reset the deferred prompt variable, since
        // prompt() can only be called once.
        window.deferredPrompt = null;
        // Hide the install button.
        divInstall.classList.toggle('hidden', true);
      });
    });
    window.addEventListener('appinstalled', e => {
      console.log('👍', 'appinstalled', e);
    });
  }
}
pwa()