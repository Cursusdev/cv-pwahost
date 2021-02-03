// List navigation items
function divBar() {
  const divNav = window.document.createElement('div')
  divNav.setAttribute('class', 'div-nav')
  let arrLi = []
  let li

  const navbar = window.document.querySelector('.navbar-collapse')
    const liNavbar = navbar.getElementsByTagName('li')
    arrLi = liNavbar

    for (li of arrLi) {
      const textHref = li.getElementsByTagName('a')[0].getAttribute('href')
      const textValue = li.getElementsByTagName('a')[0].innerHTML
      const aEl = window.document.createElement('a')
      aEl.setAttribute('href', textHref)
      aEl.innerHTML = textValue
      aEl.onclick = () => { window.document.querySelector('.div-nav').classList.toggle('active'); }
      divNav.appendChild(aEl)
    }
    navbar.appendChild(divNav)
}
divBar()

// Hamburger open navigation items
function toggle() {
  const toogle = window.document.querySelector('.toggle')
  if (toogle != null) {
    const toggleNavbar = () => {
      window.document.querySelector('.div-nav').classList.toggle('active');
    }
    toogle.addEventListener('click', e => {
      e.preventDefault();
      toggleNavbar();
    })
    // toogle.addEventListener('mouseleave', e => {
    //   window.document.querySelector('.div-nav').classList.remove('active');
    // })
  }
}
toggle()

// Accordion
function accordion() {
  const accordions = document.getElementsByClassName('accordion');
  for (acc of accordions){
    acc.onclick = function() {
      this.classList.toggle('is-open');
  
      let content = this.nextElementSibling;
      if (content.style.maxHeight){
          // accordion is open
          content.style.maxHeight = null;

      } else {
          // accordion is close
          content.style.maxHeight = content.scrollHeight + 'px';
      };
    };
  };
}
accordion()

