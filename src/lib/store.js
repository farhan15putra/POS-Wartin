import { computed, ref } from 'vue'

export const user = ref(null)
export const toast = ref('')
let toastTimer

export function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}

export function login(account) {
  user.value = account
  if (location.hash.replace(/^#\/?/, '') === 'login') location.hash = '#/kasir'
}

export function logout() {
  user.value = null
  location.hash = '#/login'
}

// ---- State keranjang & pesanan (satu store) ----
const STORAGE_KEY = 'wartin-pos'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saved = loadState()

export const cart = ref(Array.isArray(saved.cart) ? saved.cart : [])
export const orderType = ref(saved.orderType || 'dine-in')
export const table = ref(saved.table || '')
export const customerName = ref(saved.customerName || '')
export const orderNote = ref(saved.orderNote || '')
export const orderNumber = ref(saved.orderNumber || 42)
export const paymentMethod = ref('cash')

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cart: cart.value,
      orderType: orderType.value,
      table: table.value,
      customerName: customerName.value,
      orderNote: orderNote.value,
      orderNumber: orderNumber.value,
    }))
  } catch { /* storage penuh / mode privat */ }
}

// ---- Harga (integer, promo hanya untuk harga dasar) ----
export function basePrice(item) {
  const p = Number(item.promoPercent) || 0
  return p > 0 ? Math.round(item.price * (1 - p / 100)) : item.price
}

export function lineUnit(line) {
  return basePrice(line) + (Number(line.extra) || 0)
}

export function lineTotal(line) {
  return lineUnit(line) * line.qty
}

export const cartCount = computed(() => cart.value.reduce((sum, i) => sum + i.qty, 0))
const lineGross = (i) => (i.price + (Number(i.extra) || 0)) * i.qty
export const subtotal = computed(() => cart.value.reduce((sum, i) => sum + lineGross(i), 0))
export const total = computed(() => cart.value.reduce((sum, i) => sum + lineTotal(i), 0))
export const discountTotal = computed(() => subtotal.value - total.value)

export function addToCart(product, payload = {}) {
  const qty = payload.qty || 1
  const selKey = payload.selKey || ''
  const note = payload.note || ''
  const key = `${product.id}|${selKey}|${note}`
  const existing = cart.value.find((i) => i.key === key)
  if (existing) {
    existing.qty += qty
  } else {
    cart.value.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      promoPercent: product.promoPercent || 0,
      image: product.image,
      selections: payload.selections || {},
      selKey,
      summary: payload.summary || '',
      extra: Number(payload.extra) || 0,
      note,
      qty,
    })
  }
  persist()
}

export function replaceCartLine(oldKey, product, payload = {}) {
  const idx = cart.value.findIndex((i) => i.key === oldKey)
  if (idx === -1) return
  cart.value.splice(idx, 1)
  addToCart(product, payload)
}

export function setQty(key, qty) {
  const item = cart.value.find((i) => i.key === key)
  if (!item) return
  item.qty = qty
  if (item.qty <= 0) cart.value = cart.value.filter((i) => i.key !== key)
  persist()
}

export function setOrderNote(value) {
  orderNote.value = value
  persist()
}

export function removeFromCart(key) {
  cart.value = cart.value.filter((i) => i.key !== key)
  persist()
}

export function clearCart() {
  cart.value = []
  persist()
}

export function resetOrder() {
  cart.value = []
  table.value = ''
  customerName.value = ''
  orderNote.value = ''
  orderNumber.value += 1
  persist()
}
