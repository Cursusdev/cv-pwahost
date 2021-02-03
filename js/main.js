// provided the web page scroll Y (multi-browser compatible)
let scrollY = () => {
  let offsetX = window.pageXOffset !== undefined;
  let mode = ((document.compatMode || '') === 'CSS1Compat');
  
  return offsetX ? window.pageYOffset : mode ? document.documentElement.scrollTop : document.body.scrollTop;
};

// added a sticky menu at the top of the page with the scroll
const scroll = () => {
  // find menu element
  const el = window.document.querySelector('.navbar');

  // set the final scroll
  const dim = el.getBoundingClientRect();
  const top = dim.top + scrollY();
  const w = dim.width;
  const h = dim.height;
  
  // complete the div element for the scroll Y (top menu)
  let solid = window.document.createElement('div');
  solid.style.width = w + 'px';
  solid.style.height = h + 'px';

  // emits the fixed class
  const onScroll = () => {
    let isFixed = el.classList.contains('fixed');
    if (scrollY() > top && !isFixed) {
      el.classList.add('fixed');
      el.style.width = w + 'px';
      el.parentNode.insertBefore(solid, el);
    } else if (scrollY() < top && isFixed) {
      el.classList.remove('fixed');
      el.parentNode.removeChild(solid);
    }
  };
  const reload = () => {
    let isFixed = el.classList.contains('fixed');
    if (el.parentNode !== null && isFixed) {
      el.parentNode.removeChild(solid);
    }
    window.location.reload();
  };
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', reload);
};
scroll();

// set the name of the current section on the navigation bar
function currentTab() {
  // initializing arrays
  let arrHash = [], arrTop = [];
  let noActive = [];

  // find menu items
  const nav = window.document.querySelector('nav');
  // if (nav != null) {
    const li = nav.querySelectorAll('li');
    [...li].map(x => {
      if (x.childNodes[0].hash !== '') {
        let liHash = x.childNodes[0].hash;
        arrHash.push(liHash);
      }
    });

    // set the final scroll and others setting
    [...arrHash].map(secHash => {
      if (secHash.length > 0 || secHash != null) {
        const section = window.document.querySelector(secHash);
        // provides top section active
        const dim = section.getBoundingClientRect();
        const top = dim.top + scrollY();
        const bottom = dim.bottom + scrollY();
        const height = dim.height - 85;
        arrTop.push(top + height);
      }
    });
    const task = arrTop[arrTop.length - 2] - window.outerHeight
    arrTop.splice(arrTop.length - 2, 1, task)

    // provides active class on flyover
    const overview = () => {
      let current = [];
      // add the active class
      [...li].map((x, i) => {
        const liHash = x.childNodes[0].hash;
        if (arrTop[i] >= scrollY()) {
          current.push(i)
          const arrCurrent = current.reverse();
          const c = Math.min(...arrCurrent)
          if (liHash === arrHash[c] & liHash !== '') {
            x.classList.add('active');
          }
          noActive = arrHash.filter(hash => hash !== arrHash[c]);
        }
        if (arrTop[arrTop.length - 1] >= scrollY() & liHash !== '') {
          x.classList.add('active');
        }
      });

      // delete non active classes
      [...li].map(x => {
        let liHash = x.childNodes[0].hash;
        [...noActive].map(y => {
          if (liHash == y)
            x.classList.remove('active');
        });
      });
    };
    window.addEventListener('scroll', overview);
  // }
};
// adding an active class to the section overview
currentTab();
window.removeEventListener('scroll', scroll.onScroll)
window.removeEventListener('rezize', scroll.reload)
