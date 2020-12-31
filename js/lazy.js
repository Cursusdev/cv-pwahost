
// Lazy load
function lazyLoad() {
  if (window.document.getElementsByClassName('lazy').length > 0) {
    let lazy = [];
  
    const setLazy = () => {
      lazy = window.document.getElementsByClassName('lazy');
    }
    const lazyLoad = () => {
      for(lazyIdx of lazy){
        if(isInViewport(lazyIdx)){
          if (lazyIdx.getAttribute('data-srcset') && lazyIdx.getAttribute('data-sizes')){
            lazyIdx.srcset = lazyIdx.getAttribute('data-srcset');
            lazyIdx.removeAttribute('data-srcset');
            lazyIdx.sizes = lazyIdx.getAttribute('data-sizes');
            lazyIdx.removeAttribute('data-sizes');
          }
          if (lazyIdx.getAttribute('data-src')){
            lazyIdx.src = lazyIdx.getAttribute('data-src');
            lazyIdx.removeAttribute('data-src');
          }
        }
      }
      cleanLazy();
    }

    function cleanLazy() {
      lazy = Array.prototype.filter.call(lazy, function(l){
        return l.getAttribute('data-srcset') && l.getAttribute('data-sizes') && l.getAttribute('data-src');
      });
    }

    function isInViewport(el) {
      let rect = el.getBoundingClientRect();
      return (
        rect.bottom >= 0 && 
        rect.right >= 0 && 
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    const registerListener = (event, func) => {
      if (window.addEventListener) {
        window.addEventListener(event, func)
      } else {
        window.attachEvent('on' + event, func)
      }
    }

    registerListener('load', setLazy());
    registerListener('load', lazyLoad);
    registerListener('scroll', lazyLoad);
  }
}
lazyLoad()
