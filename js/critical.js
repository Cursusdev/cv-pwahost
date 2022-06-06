// image preloading
let images = new Array()
function preload() {
  for (const i = 0; i < preload.arguments.length; i++) {
    images[i] = new Image()
    images[i].src = preload.arguments[i]
  }
}
preload(
  'img/Photo-identité_280w.a305b7e9bd68850b9b46c4a78bf2668c.jpg'
)

