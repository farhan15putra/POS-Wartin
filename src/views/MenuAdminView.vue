<script setup>
import { computed, reactive, ref } from 'vue'
import { categories, menuItems } from '../mocks/data'
import { formatCurrency } from '../lib/format'
import { showToast } from '../lib/store'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import SelectField from '../components/ui/SelectField.vue'

const search = ref('')
const activeCategory = ref('semua')
const drawer = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)
const blankDraft = () => ({ name: '', sku: '', category: 'makanan', price: 0, promo: 0, available: true, image: '', groups: [] })
const draft = reactive(blankDraft())
const typeOptions = [
  { value: 'single', label: 'Pilih satu' },
  { value: 'multi', label: 'Pilih banyak' },
]
const uid = () => Math.random().toString(36).slice(2, 8)
const cloneGroups = (groups) => JSON.parse(JSON.stringify(groups || []))

const catLabel = (id) => categories.find((c) => c.id === id)?.label || id
const catOptions = computed(() => categories.filter((c) => c.id !== 'semua').map((c) => ({ value: c.id, label: c.label })))
const filtered = computed(() => menuItems.filter((i) => {
  const okCat = activeCategory.value === 'semua' || i.category === activeCategory.value
  return okCat && (i.name.toLowerCase().includes(search.value.toLowerCase()) || i.sku.toLowerCase().includes(search.value.toLowerCase()))
}))
const stats = computed(() => ({
  total: menuItems.length,
  available: menuItems.filter((i) => i.available).length,
  promo: menuItems.filter((i) => i.promo > 0).length,
}))

function addGroup() {
  draft.groups.push({
    id: `g-${uid()}`,
    name: '',
    type: 'single',
    required: true,
    options: [{ id: `o-${uid()}`, name: '', extraPrice: 0, isDefault: true }],
  })
}

function removeGroup(index) {
  draft.groups.splice(index, 1)
}

function addOption(group) {
  group.options.push({ id: `o-${uid()}`, name: '', extraPrice: 0, isDefault: false })
}

function removeOption(group, index) {
  const removedDefault = group.options[index]?.isDefault
  group.options.splice(index, 1)
  if (removedDefault && group.options[0]) group.options[0].isDefault = true
}

function setDefault(group, option) {
  if (group.type === 'single') group.options.forEach((o) => { o.isDefault = o.id === option.id })
  else option.isDefault = !option.isDefault
}

function onTypeChange(group) {
  if (group.type !== 'single') return
  const chosen = group.options.find((o) => o.isDefault) || group.options[0]
  group.options.forEach((o) => { o.isDefault = o === chosen })
}

function setGroupType(group, value) {
  group.type = value
  onTypeChange(group)
}

function prepareGroups() {
  const groups = draft.groups
    .map((g) => ({
      id: g.id,
      name: g.name.trim(),
      type: g.type,
      required: !!g.required,
      options: g.options
        .filter((o) => o.name.trim())
        .map((o) => ({ id: o.id, name: o.name.trim(), extraPrice: Number(o.extraPrice) || 0, isDefault: !!o.isDefault })),
    }))
    .filter((g) => g.name && g.options.length)
  groups.forEach((g) => {
    if (g.type !== 'single') return
    const chosen = g.options.find((o) => o.isDefault) || g.options[0]
    g.options.forEach((o) => { o.isDefault = o.id === chosen.id })
  })
  return groups
}

function openDrawer(item = null) {
  editing.value = item
  Object.assign(draft, item
    ? { name: item.name, sku: item.sku, category: item.category, price: item.price, promo: item.promo, available: item.available, image: item.image, groups: cloneGroups(item.groups) }
    : blankDraft())
  drawer.value = true
}

function save() {
  if (!draft.name) return
  const promo = Number(draft.promo) || 0
  const payload = {
    name: draft.name,
    sku: draft.sku,
    category: draft.category,
    price: Number(draft.price),
    promo,
    promoPercent: promo,
    available: !!draft.available,
    image: draft.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    groups: prepareGroups(),
  }
  if (editing.value) {
    Object.assign(editing.value, payload)
    showToast(`${draft.name} diperbarui`)
  } else {
    menuItems.unshift({ id: Date.now(), stock: draft.available ? 1 : 0, ...payload })
    showToast(`${draft.name} ditambahkan ke menu`)
  }
  drawer.value = false
}

function toggle(item) {
  item.available = !item.available
  showToast(`${item.name} ${item.available ? 'diaktifkan' : 'dinonaktifkan'}`)
}

function removeItem() {
  const idx = menuItems.indexOf(pendingDelete.value)
  if (idx !== -1) menuItems.splice(idx, 1)
  showToast(`${pendingDelete.value.name} dihapus`)
  pendingDelete.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-headline-xl text-primary">Manajemen Menu</h1>
        <p class="text-body-md text-on-surface-variant">Kelola daftar menu, harga, dan ketersediaan produk.</p>
      </div>
      <button type="button" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 py-3 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105" @click="openDrawer()">
        <span class="material-symbols-outlined text-[20px]">add</span>Tambah Menu
      </button>
    </header>

    <dl class="grid grid-cols-1 divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div v-for="s in [['Total Menu', stats.total, 'restaurant_menu', 'text-primary'], ['Tersedia', stats.available, 'check_circle', 'text-secondary'], ['Sedang Promo', stats.promo, 'sell', 'text-secondary']]" :key="s[0]" class="flex items-center gap-3 p-4">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low" :class="s[3]"><span class="material-symbols-outlined">{{ s[2] }}</span></span>
        <div><dt class="text-label-sm text-on-surface-variant">{{ s[0] }}</dt><dd class="numeric text-headline-md text-primary">{{ s[1] }}</dd></div>
      </div>
    </dl>

    <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
          <input v-model="search" type="search" placeholder="Cari nama atau SKU..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari menu" />
        </div>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button v-for="cat in categories" :key="cat.id" type="button" class="shrink-0 rounded-full px-4 py-2 text-label-md transition-colors" :class="activeCategory === cat.id ? 'bg-secondary-fixed text-primary font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'" @click="activeCategory = cat.id">{{ cat.label }}</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th class="py-3 pr-3 font-semibold">Menu</th>
              <th class="px-3 py-3 font-semibold">Kategori</th>
              <th class="px-3 py-3 text-right font-semibold">Harga</th>
              <th class="px-3 py-3 font-semibold">Status</th>
              <th class="py-3 pl-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id" class="border-b border-surface-container-low">
              <td class="py-3 pr-3">
                <div class="flex items-center gap-3">
                  <img :src="item.image" :alt="item.name" class="h-11 w-11 rounded-xl object-cover" />
                  <div><p class="text-label-md font-semibold text-primary">{{ item.name }}</p><p class="text-label-sm text-on-surface-variant">{{ item.sku }}</p></div>
                </div>
              </td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ catLabel(item.category) }}</td>
              <td class="numeric px-3 py-3 text-right text-label-numeric-md text-primary">
                <span v-if="item.promo" class="mr-1 text-label-sm text-on-surface-variant line-through">{{ formatCurrency(item.price) }}</span>{{ formatCurrency(item.promo ? Math.round(item.price * (1 - item.promo / 100)) : item.price) }}
              </td>
              <td class="px-3 py-3">
                <span class="inline-flex items-center gap-1.5 text-label-md font-medium" :class="item.available ? 'text-secondary' : 'text-error'">
                  <span class="material-symbols-outlined text-[18px]">{{ item.available ? 'check_circle' : 'cancel' }}</span>
                  {{ item.available ? 'Tersedia' : 'Habis' }}
                </span>
              </td>
              <td class="py-3 pl-3">
                <div class="flex items-center justify-end gap-1">
                  <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Ubah" @click="openDrawer(item)"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="item.available"
                    :aria-label="item.available ? 'Nonaktifkan' : 'Aktifkan'"
                    class="relative mx-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 motion-reduce:transition-none"
                    :class="item.available ? 'bg-secondary-container' : 'bg-surface-container-highest'"
                    @click="toggle(item)"
                  >
                    <span
                      class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out motion-reduce:transition-none"
                      :class="item.available ? 'translate-x-[22px]' : 'translate-x-0.5'"
                    ></span>
                  </button>
                  <button type="button" class="rounded-lg p-2 text-error hover:bg-error-container" aria-label="Hapus" @click="pendingDelete = item"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="py-10 text-center text-body-md text-on-surface-variant">Menu tidak ditemukan.</p>
      </div>
    </div>
  </div>

  <!-- Drawer -->
  <Transition name="drawer">
    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-primary/40 backdrop-blur-sm" @click.self="drawer = false">
    <aside class="flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header class="flex items-center justify-between border-b border-surface-container-high px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="drawer-title" class="text-headline-md text-primary">{{ editing ? 'Ubah Menu' : 'Tambah Menu Baru' }}</h2>
          <p class="text-label-sm text-on-surface-variant">Lengkapi detail produk lalu simpan.</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup" @click="drawer = false"><span class="material-symbols-outlined">close</span></button>
      </header>
      <form class="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-none sm:px-6 sm:py-5" @submit.prevent="save">
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="m-image">URL Gambar</label>
          <input id="m-image" v-model="draft.image" type="url" placeholder="https://..." class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="m-name">Nama Menu <span class="text-error">*</span></label>
          <input id="m-name" v-model="draft.name" type="text" required class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="m-sku">SKU</label>
            <input id="m-sku" v-model="draft.sku" type="text" placeholder="MKN-004" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="m-cat">Kategori</label>
            <SelectField id="m-cat" v-model="draft.category" :options="catOptions" aria-label="Kategori menu" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="m-price">Harga (Rp)</label>
            <input id="m-price" v-model.number="draft.price" type="number" min="0" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="m-promo">Diskon (%)</label>
            <input id="m-promo" v-model.number="draft.promo" type="number" min="0" max="100" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <section class="rounded-xl border border-surface-container-high p-3">
          <div class="mb-2 flex items-start justify-between gap-2">
            <div>
              <p class="text-label-md font-semibold text-primary">Varian</p>
              <p class="text-label-sm text-on-surface-variant">Pilihan yang muncul saat menu dipilih di kasir.</p>
            </div>
            <button type="button" class="flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg px-2 text-label-sm font-semibold text-secondary transition-colors hover:bg-secondary-fixed/40" @click="addGroup">
              <span class="material-symbols-outlined text-[18px]">add</span>Grup
            </button>
          </div>

          <p v-if="!draft.groups.length" class="rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">Belum ada varian. Menu tanpa varian langsung masuk keranjang.</p>

          <div v-for="(group, gi) in draft.groups" :key="group.id" class="mb-2 rounded-lg bg-surface-container-low p-3 last:mb-0">
            <div class="flex items-center gap-2">
              <input v-model="group.name" type="text" placeholder="Nama grup (mis. Level pedas)" class="h-11 min-w-0 flex-1 rounded-lg bg-surface-container-lowest px-3 text-label-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container" aria-label="Hapus grup" @click="removeGroup(gi)"><span class="material-symbols-outlined text-[18px]">delete</span></button>
            </div>

            <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <span class="mb-1 block text-label-sm text-on-surface-variant">Tipe</span>
                <SelectField :id="`g-type-${group.id}`" :model-value="group.type" :options="typeOptions" aria-label="Tipe pilihan" @update:model-value="setGroupType(group, $event)" />
              </div>
              <label class="flex min-h-[44px] cursor-pointer items-center gap-2 self-end rounded-lg bg-surface-container-lowest px-3">
                <input v-model="group.required" type="checkbox" class="h-4 w-4 accent-primary" />
                <span class="text-label-sm text-primary">Wajib diisi</span>
              </label>
            </div>

            <div class="mt-2 space-y-1.5">
              <div v-for="(option, oi) in group.options" :key="option.id" class="rounded-lg bg-surface-container-lowest p-2">
                <input v-model="option.name" type="text" placeholder="Nama opsi" class="h-10 w-full rounded-md bg-surface-container-low px-2 text-label-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <div class="mt-1.5 flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-1.5">
                    <span class="text-label-sm text-on-surface-variant">+Rp</span>
                    <input v-model.number="option.extraPrice" type="number" min="0" class="numeric h-10 w-24 rounded-md bg-surface-container-low px-2 text-right text-label-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" class="flex h-10 w-10 items-center justify-center rounded-md transition-colors" :class="option.isDefault ? 'text-secondary' : 'text-outline hover:bg-surface-container'" :aria-pressed="option.isDefault" :aria-label="`Tandai ${option.name || 'opsi'} sebagai default`" @click="setDefault(group, option)">
                      <span class="material-symbols-outlined text-[18px]">{{ group.type === 'single' ? (option.isDefault ? 'radio_button_checked' : 'radio_button_unchecked') : (option.isDefault ? 'check_box' : 'check_box_outline_blank') }}</span>
                    </button>
                    <button type="button" class="flex h-10 w-10 items-center justify-center rounded-md text-error transition-colors hover:bg-error-container" aria-label="Hapus opsi" @click="removeOption(group, oi)"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant text-label-sm font-semibold text-primary transition-colors hover:bg-surface-container" @click="addOption(group)">
              <span class="material-symbols-outlined text-[18px]">add</span>Tambah opsi
            </button>
          </div>
        </section>

        <label class="flex cursor-pointer items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
          <span class="text-label-md text-primary">Tersedia di kasir</span>
          <input v-model="draft.available" type="checkbox" class="h-5 w-5 rounded accent-primary" />
        </label>
      </form>
      <footer class="flex gap-3 border-t border-surface-container-high px-4 py-4 sm:px-6">
        <button type="button" class="flex-1 rounded-xl border border-surface-container-high px-4 py-3 text-label-md text-primary hover:bg-surface-container-low" @click="drawer = false">Batal</button>
        <button type="button" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105" @click="save"><span class="material-symbols-outlined text-[20px]">save</span>Simpan Menu</button>
      </footer>
    </aside>
    </div>
  </Transition>

  <ConfirmDialog v-if="pendingDelete" :title="`Hapus ${pendingDelete.name}?`" message="Menu akan dihapus dari daftar. Tindakan ini tidak bisa dibatalkan." confirm-label="Ya, hapus" @confirm="removeItem" @cancel="pendingDelete = null" />
</template>
