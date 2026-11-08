import { ref } from 'vue'

function parse(hash) {
  return hash.replace(/^#\/?/, '').split('?')[0] || 'kasir'
}

export const route = ref(parse(window.location.hash))

window.addEventListener('hashchange', () => {
  route.value = parse(window.location.hash)
})

export function navigate(name) {
  window.location.hash = `#/${name}`
}
