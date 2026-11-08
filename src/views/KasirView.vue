<script setup>
import { computed, ref } from 'vue'
import { categories, currentUser, menuItems, store, tables } from '../mocks/data'
import { formatCurrency } from '../lib/format'
import {
  addToCart, basePrice, cart, cartCount, clearCart, customerName, discountTotal, lineTotal, lineUnit,
  orderNote, orderNumber, orderType, paymentMethod, persist, removeFromCart, replaceCartLine, resetOrder,
  setOrderNote, setQty, showToast, subtotal, table, total,
} from '../lib/store'
import PaymentModal from '../components/pos/PaymentModal.vue'
import VariantModal from '../components/pos/VariantModal.vue'
import TablePicker from '../components/pos/TablePicker.vue'
import SuccessModal from '../components/pos/SuccessModal.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import rakunLogo from '../assets/rakun1.webp'

const search = ref('')
const activeCategory = ref('semua')
const filter = ref('semua')
const variantModal = ref(null)
const showPayment = ref(false)
const showSuccess = ref(false)
const receipt = ref(null)
const pendingDelete = ref(null)
const pendingClear = ref(false)
const cashReceived = ref('')
const showTablePicker = ref(false)
const pendingPick = ref(null)
const justAdded = ref(null)

const inStock = (item) => item.available !== false && (item.stock ?? 1) > 0
const hasGroups = (item) => Array.isArray(item.groups) && item.groups.length > 0

const filteredMenu = computed(() => menuItems.filter((item) => {
  const byCategory = activeCategory.value === 'semua' || item.category === activeCategory.value
  const byFilter = filter.value === 'semua' || (filter.value === 'tersedia' ? inStock(item) : item.promoPercent > 0)
  const q = search.value.trim().toLowerCase()
  const bySearch = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
  return byCategory && byFilter && bySearch
}))

const inCart = (id) => cart.value.filter((i) => i.id === id).reduce((sum, i) => sum + i.qty, 0)
const cashValue = computed(() => Number(cashReceived.value || 0))
const change = computed(() => Math.max(0, cashValue.value - total.value))
const orderCode = computed(() => `Pesanan #${String(orderNumber.value).padStart(4, '0')}`)
const orderShort = computed(() => `#${String(orderNumber.value).padStart(4, '0')}`)
const tableLabel = computed(() => {
  if (orderType.value === 'take-away') return customerName.value ? `Take Away · ${customerName.value}` : 'Take Away'
  return table.value ? `Meja ${table.value}` : 'Meja belum dipilih'
})
const needsTable = computed(() => orderType.value === 'dine-in' && !table.value)
const catCount = (id) => menuItems.filter((i) => i.category === id).length

function pick(item) {
  if (!inStock(item)) return
  if (orderType.value === 'dine-in' && !table.value) {
    pendingPick.value = item
    showTablePicker.value = true
    showToast('Pilih meja dulu sebelum menambah item')
    return
  }
  runPick(item)
}

function runPick(item) {
  if (hasGroups(item)) {
    variantModal.value = { item, groups: item.groups, initial: null, editKey: null }
    return
  }
  addToCart(item)
  showToast(`${item.name} ditambahkan`)
  justAdded.value = item.id
  setTimeout(() => { if (justAdded.value === item.id) justAdded.value = null }, 450)
}

function chooseTable(value) {
  table.value = value
  orderType.value = 'dine-in'
  showTablePicker.value = false
  persist()
  showToast(`Meja ${value} dipilih`)
  if (pendingPick.value) runPick(pendingPick.value)
  pendingPick.value = null
}

function closeTable() {
  showTablePicker.value = false
  pendingPick.value = null
}

function tableTakeaway() {
  orderType.value = 'take-away'
  table.value = ''
  showTablePicker.value = false
  persist()
  if (pendingPick.value) runPick(pendingPick.value)
  pendingPick.value = null
}

function setOrderType(type) {
  orderType.value = type
  if (type === 'take-away') table.value = ''
  persist()
}

function decItem(item) {
  const lines = cart.value.filter((i) => i.id === item.id)
  const last = lines[lines.length - 1]
  if (last) setQty(last.key, last.qty - 1)
}

function editLine(line) {
  const product = menuItems.find((p) => p.id === line.id) || line
  variantModal.value = {
    item: product,
    groups: product.groups || [],
    editKey: line.key,
    initial: { qty: line.qty, note: line.note, selections: line.selections || {} },
  }
}

function addVariant(payload) {
  const { item, editKey } = variantModal.value
  if (editKey) replaceCartLine(editKey, item, payload)
  else addToCart(item, payload)
  showToast(`${item.name} ditambahkan`)
  variantModal.value = null
}

function clearAll() {
  clearCart()
  pendingClear.value = false
  showToast('Keranjang dikosongkan')
}

function openPayment() {
  if (!cart.value.length) return
  if (needsTable.value) {
    showToast('Pilih meja dulu sebelum membayar')
    return
  }
  cashReceived.value = ''
  showPayment.value = true
}

function finishPayment() {
  if (paymentMethod.value === 'cash' && cashValue.value < total.value) return
  const now = new Date()
  receipt.value = {
    code: `#TRX-${String(orderNumber.value).padStart(4, '0')}`,
    orderLabel: tableLabel.value,
    cashier: currentUser.name,
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(now),
    time: `${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)} WIB`,
    items: cart.value.map((i) => ({ name: i.name, qty: i.qty, unit: lineUnit(i), total: lineTotal(i), summary: i.summary, note: i.note })),
    orderNote: orderNote.value.trim(),
    subtotal: subtotal.value,
    discount: discountTotal.value,
    total: total.value,
    method: paymentMethod.value,
    methodLabel: { cash: 'Tunai', qris: 'QRIS' }[paymentMethod.value],
    cash: paymentMethod.value === 'cash' ? cashValue.value : 0,
    change: change.value,
  }
  clearCart()
  cashReceived.value = ''
  showPayment.value = false
  showSuccess.value = true
}

function newTransaction() {
  resetOrder()
  receipt.value = null
  showSuccess.value = false
  showTablePicker.value = false
}
</script>

<template>
  <div class="grid grid-cols-1 items-start gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
    <!-- Katalog menu -->
    <section class="order-1 flex min-w-0 flex-col gap-4 xl:order-2">
      <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <!-- Toolbar -->
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="relative flex-1 md:max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
            <input v-model="search" type="search" placeholder="Cari menu atau SKU..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari menu" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center rounded-xl bg-surface-container-low p-1">
              <button v-for="f in [['semua', 'Semua'], ['tersedia', 'Tersedia'], ['promo', 'Promo']]" :key="f[0]" type="button" class="rounded-lg px-3 py-1.5 text-label-md transition-colors" :class="filter === f[0] ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="filter = f[0]">{{ f[1] }}</button>
            </div>
            <button v-if="orderType === 'dine-in'" type="button" class="flex min-h-[44px] items-center gap-2 rounded-xl bg-surface-container-low px-3 text-label-md transition-colors hover:bg-surface-container" :class="table ? 'font-semibold text-primary' : 'font-semibold text-secondary'" @click="showTablePicker = true">
              <span class="material-symbols-outlined text-[18px]">table_restaurant</span>
              {{ table ? `Meja ${table}` : 'Pilih meja' }}
            </button>
            <span v-else class="flex min-h-[44px] items-center gap-2 rounded-xl bg-surface-container-low px-3 text-label-md font-semibold text-primary">
              <span class="material-symbols-outlined text-[18px]">takeout_dining</span>Take Away
            </span>
          </div>
        </div>

        <!-- Kategori -->
        <nav class="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none" aria-label="Kategori Menu">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="flex h-[88px] w-[88px] shrink-0 flex-col items-start justify-between rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98]"
            :class="activeCategory === cat.id ? 'border-secondary-container bg-secondary-fixed text-on-secondary-fixed shadow-sm' : 'border-transparent bg-surface-container-lowest text-on-surface-variant shadow-sm hover:-translate-y-0.5 hover:border-surface-container-high hover:shadow-md'"
            :aria-pressed="activeCategory === cat.id"
            @click="activeCategory = cat.id"
          >
            <span class="material-symbols-outlined text-[24px]" :class="activeCategory === cat.id ? 'text-secondary' : 'text-secondary-container'">{{ cat.icon }}</span>
            <span class="w-full truncate text-label-sm font-bold leading-tight">{{ cat.label }}</span>
            <span class="text-[10px] font-medium leading-none" :class="activeCategory === cat.id ? 'text-on-secondary-fixed' : 'text-on-surface-variant'">{{ cat.id === 'semua' ? menuItems.length : catCount(cat.id) }} item</span>
          </button>
        </nav>

        <!-- Grid produk -->
        <TransitionGroup name="product" tag="div" class="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
          <article v-for="(item, index) in filteredMenu" :key="item.id" :style="{ '--stagger-index': index }" class="hover-outline relative flex flex-col overflow-hidden rounded-xl bg-surface-container-low transition-transform duration-150 hover:-translate-y-0.5" :class="{ 'opacity-60': !inStock(item), 'flash-outline': justAdded === item.id }">
            <div class="relative aspect-square w-full overflow-hidden bg-surface-container-high">
              <img :src="item.image" :alt="item.name" loading="lazy" class="h-full w-full object-cover" :class="{ grayscale: !inStock(item) }" />
              <span v-if="!inStock(item)" class="absolute inset-0 flex items-center justify-center bg-primary/45">
                <span class="rounded-md bg-surface-container-lowest px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-error">Stok Habis</span>
              </span>
            </div>
            <div class="flex flex-1 flex-col gap-1 p-2.5">
              <h3 class="line-clamp-2 min-h-10 text-label-md font-semibold leading-5" :class="inStock(item) ? 'text-primary' : 'text-on-surface-variant'">{{ item.name }}</h3>
              <div v-if="!inStock(item)" class="mt-1 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-surface-container text-label-sm text-outline">Stok Habis</div>
              <div v-else-if="inCart(item.id)" class="mt-1 flex min-h-[44px] items-center justify-between rounded-lg bg-surface-container-lowest px-1">
                <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-container" aria-label="Kurangi" @click="decItem(item)"><span class="material-symbols-outlined text-[18px]">remove</span></button>
                <span class="numeric text-label-md font-bold text-primary">{{ inCart(item.id) }}</span>
                <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-fixed transition-colors hover:brightness-105" aria-label="Tambah" @click="pick(item)"><span class="material-symbols-outlined text-[18px]">add</span></button>
              </div>
              <div v-else class="mt-1 flex min-h-[44px] items-center justify-between gap-2">
                <p class="numeric min-w-0 truncate text-label-md font-semibold text-primary">
                  <span v-if="item.promoPercent" class="mr-1 text-label-sm text-on-surface-variant line-through">{{ formatCurrency(item.price) }}</span>
                  {{ formatCurrency(basePrice(item)) }}
                </p>
                <button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-fixed transition-colors hover:brightness-105 active:scale-[0.96]" :aria-label="`Tambah ${item.name}`" @click="pick(item)">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
          </article>
        </TransitionGroup>
        <p v-if="!filteredMenu.length" class="rounded-xl bg-surface-container-low p-10 text-center text-body-md text-on-surface-variant">Menu tidak ditemukan. Coba kata kunci atau kategori lain.</p>
      </div>
    </section>

    <!-- Pesanan berjalan -->
    <aside class="order-2 flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm xl:order-1 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-hidden">
      <div class="flex items-center gap-2.5 border-b border-surface-container-high pb-3">
        <img :src="rakunLogo" alt="Logo Wartin" class="h-9 w-9 shrink-0 object-contain" />
        <div class="min-w-0 flex-1">
          <p class="text-label-md font-semibold text-primary">Pesanan</p>
          <p class="truncate text-label-sm text-on-surface-variant">{{ orderShort }} · {{ tableLabel }}</p>
        </div>
        <button v-if="cart.length" type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container" aria-label="Kosongkan keranjang" title="Kosongkan" @click="pendingClear = true"><span class="material-symbols-outlined text-[20px]">remove_shopping_cart</span></button>
      </div>

      <div class="grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1">
        <button type="button" class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-label-md transition-colors" :class="orderType === 'dine-in' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant'" @click="setOrderType('dine-in')"><span class="material-symbols-outlined text-[18px]">restaurant</span>Dine In</button>
        <button type="button" class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-label-md transition-colors" :class="orderType === 'take-away' ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant'" @click="setOrderType('take-away')"><span class="material-symbols-outlined text-[18px]">takeout_dining</span>Take Away</button>
      </div>

      <label v-if="orderType === 'take-away'" class="flex flex-col gap-1.5">
        <span class="text-label-sm text-on-surface-variant">Nama pelanggan (opsional)</span>
        <input v-model="customerName" type="text" placeholder="Contoh: Andi" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </label>

      <div v-if="cart.length" class="flex items-center justify-between text-label-sm text-on-surface-variant">
        <span class="font-semibold uppercase tracking-wider">Item ({{ cartCount }})</span>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <p v-if="!cart.length" class="rounded-xl bg-surface-container-low p-6 text-center text-body-md text-on-surface-variant">Keranjang kosong. Pilih menu untuk mulai pesanan.</p>
        <ul v-else class="divide-y divide-surface-container-high">
          <li v-for="line in cart" :key="line.key" class="flex flex-col gap-1 py-2.5">
            <div class="flex items-start justify-between gap-3">
              <button type="button" class="min-w-0 flex-1 text-left" @click="editLine(line)">
                <p class="truncate text-label-md font-semibold text-primary">{{ line.name }}</p>
                <p v-if="line.summary" class="truncate text-label-sm text-on-surface-variant">{{ line.summary }}</p>
                <p v-if="line.note" class="truncate text-label-sm italic text-on-surface-variant">{{ line.note }}</p>
              </button>
              <span class="numeric shrink-0 text-label-md font-semibold text-primary">{{ formatCurrency(lineTotal(line)) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container" :aria-label="`Catatan ${line.name}`" title="Catatan / varian" @click="editLine(line)"><span class="material-symbols-outlined text-[18px]">edit_note</span></button>
              <div class="flex items-center gap-1.5">
                <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container" title="Hapus" @click="pendingDelete = line.key"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                <div class="flex items-center rounded-lg bg-surface-container-low p-0.5">
                  <button type="button" class="flex h-11 w-11 items-center justify-center rounded-md font-bold text-primary transition-colors hover:bg-surface-container" aria-label="Kurangi jumlah" @click="setQty(line.key, line.qty - 1)">−</button>
                  <span class="numeric w-6 text-center text-label-sm font-bold">{{ line.qty }}</span>
                  <button type="button" class="flex h-11 w-11 items-center justify-center rounded-md font-bold text-primary transition-colors hover:bg-surface-container" aria-label="Tambah jumlah" @click="setQty(line.key, line.qty + 1)">+</button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="text-label-sm text-on-surface-variant">Catatan pesanan (opsional)</span>
        <textarea :value="orderNote" rows="2" placeholder="mis. bungkus terpisah" class="w-full resize-none rounded-xl bg-surface-container-low px-4 py-2.5 text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20" @input="setOrderNote($event.target.value)"></textarea>
      </label>

      <div class="border-t border-surface-container-high pt-2 text-body-md">
        <div class="flex justify-between text-on-surface-variant"><span>Subtotal</span><span class="numeric">{{ formatCurrency(subtotal) }}</span></div>
        <div class="flex justify-between text-on-surface-variant"><span>Diskon promo</span><span class="numeric">{{ discountTotal ? `− ${formatCurrency(discountTotal)}` : formatCurrency(0) }}</span></div>
        <div class="mt-1.5 flex items-baseline justify-between">
          <span class="text-label-md font-semibold text-primary">Total</span>
          <strong class="numeric text-headline-lg text-primary">{{ formatCurrency(total) }}</strong>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button v-for="m in [['cash', 'Tunai', 'payments'], ['qris', 'QRIS', 'qr_code_scanner']]" :key="m[0]" type="button" class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-label-md font-semibold transition-colors" :class="paymentMethod === m[0] ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'" @click="paymentMethod = m[0]">
          <span class="material-symbols-outlined text-[20px]">{{ m[2] }}</span>{{ m[1] }}
        </button>
      </div>

      <p v-if="needsTable && cart.length" class="text-label-sm font-medium text-error">Pilih meja dulu sebelum membayar.</p>
      <button type="button" class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-md font-semibold text-on-secondary-fixed shadow-md transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!cart.length || needsTable" @click="openPayment">
        <span class="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>Bayar {{ formatCurrency(total) }}
      </button>
    </aside>
  </div>

  <TablePicker
    v-if="showTablePicker"
    :selected="table"
    :tables="tables"
    @select="chooseTable"
    @close="closeTable"
    @takeaway="tableTakeaway"
  />
  <VariantModal v-if="variantModal" :item="variantModal.item" :groups="variantModal.groups" :initial="variantModal.initial" @close="variantModal = null" @add="addVariant" />
  <PaymentModal
    v-if="showPayment"
    :method="paymentMethod"
    :total="total"
    :order-code="orderCode"
    :table="tableLabel"
    :cashier="currentUser.name"
    :item-count="cartCount"
    :cash-received="cashReceived"
    :change="change"
    @close="showPayment = false"
    @update:cash="cashReceived = $event"
    @finish="finishPayment"
  />
  <SuccessModal v-if="showSuccess && receipt" :receipt="receipt" @print="() => window.print()" @new="newTransaction" />
  <ConfirmDialog
    v-if="pendingDelete"
    title="Hapus item pesanan?"
    message="Item akan dihapus dari pesanan ini."
    confirm-label="Ya, hapus"
    @confirm="removeFromCart(pendingDelete); pendingDelete = null"
    @cancel="pendingDelete = null"
  />
  <ConfirmDialog
    v-if="pendingClear"
    title="Kosongkan keranjang?"
    message="Semua item pada pesanan ini akan dihapus."
    confirm-label="Ya, kosongkan"
    @confirm="clearAll"
    @cancel="pendingClear = false"
  />
</template>