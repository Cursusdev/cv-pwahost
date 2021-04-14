// image preloading
var images = new Array()
function preload() {
  for (i = 0; i < preload.arguments.length; i++) {
    images[i] = new Image()
    images[i].src = preload.arguments[i]
  }
}
preload(
  'img/Photo-identité_280w.eb04aa467b145a348b4e9a436801aabb.jpg'
)

