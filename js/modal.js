// Get Modal
export function modal() {
  const modal = window.document.getElementsByClassName('modal')

  if (modal.length > 0) {
    let listModal = [...modal]
    let task = []
    let nb = 0

    while (nb < listModal.length) {
      task.push(nb)
      nb++
    }
    task.map(nb => {
      window.document.getElementById(`pop_${nb}`).addEventListener('click', e => {
        e.preventDefault()
        done(nb)
      })
    })

    // Load Modal
    function done(id) {
      // Modals lazy load
      const lazyModal = list => {
        for(tag of list) {
          let img = tag.getElementsByClassName('lazy_load')
          img[0].setAttribute('src', img[0].dataset.src)
          img[0].setAttribute('srcset', img[0].dataset.srcset)
          img[0].setAttribute('sizes', img[0].dataset.sizes)
          // console.log(img[0].dataset.src)
        }
      }
      let preview0 = window.document.querySelector(`#imgpreview_${id}`)
      // console.log(preview0.getAttribute('src'))
      let img0 = window.document.getElementById(`imgsrc_${id}`)

      preview0.setAttribute('src', img0.getAttribute('data-src'))
      preview0.setAttribute('srcset', img0.getAttribute('data-srcet'))
      preview0.setAttribute('sizes', img0.getAttribute('data-sizes'))
      listModal[id].setAttribute('aria-hidden', 'false')
      listModal[id].style.display = 'block'
      lazyModal(listModal)
      
      let arrCroix = []
      let croixModal = listModal[id].getElementsByClassName('close')
      arrCroix = croixModal

      for (croix of arrCroix) {
        croix.onclick = () => { listModal[id].style.display = 'none' }
      }
      let arrBtn = []
      let btnModal = listModal[id].getElementsByClassName('btn-modal')
      arrBtn = btnModal

      for (btn of arrBtn) {
        btn.onclick = () => { listModal[id].style.display = 'none' }
      }
    }
  }
}
// modal()
