// Fader pages
function faderPage() {
  // upload page
  function fadeInPage() {
    const fader = document.getElementById('fader');
    fader.classList.add('fade-out');
  }

  window.document.addEventListener('DOMContentLoaded', () => {
    const anchors = document.getElementsByTagName('a');
    for (anchor of anchors) {
      if (anchor.hostname !== window.location.hostname || anchor.pathname === window.location.pathname) {
        continue;
      }
      anchor.addEventListener('click', e => {
        const fader = document.getElementById('fader'),
        anchor = e.currentTarget;

        const listener = () => {
          window.location = anchor.href;
          fader.removeEventListener('animationend', listener);
        };
        fader.addEventListener('animationend', listener);

        e.preventDefault();
        fader.classList.add('fade-in');
      });
    }
  });
  window.document.addEventListener('pageshow', e => {
    console.log('pageshow')
    if (!e.persisted) {
      return;
    }
    const fader = document.getElementById('fader');
    fader.classList.remove('fade-in');
  });
  fadeInPage()

  const exit = e => {
    e.preventDefault();
    return;
  }

  if ('onpagehide' in window) {
    window.addEventListener('pagehide', exit, false);
  } else {
    window.addEventListener('unload', exit, false);
  }
}
faderPage()

