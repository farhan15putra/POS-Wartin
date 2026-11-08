<script setup>
import { computed, reactive, ref } from 'vue'
import { ingredients } from '../mocks/data'
import { showToast } from '../lib/store'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import SelectField from '../components/ui/SelectField.vue'

const search = ref('')
const filter = ref('semua')
const drawer = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)

const blankDraft = () => ({ name: '', code: '', category: 'Bahan Makanan', unit: 'Kg', stock: 0, min: 0 })
const draft = reactive(blankDraft())

const unitOptions = ['Kg', 'Liter', 'Gram', 'Pcs', 'Botol', 'Pack'].map((u) => ({ value: u, label: u }))
const categoryOptions = computed(() => [...new Set(ingredients.map((i) => i.category))].map((c) => ({ value: c, label: c })))

const statusMeta = {
  aman: { label: 'Aman', icon: 'check_circle', text: 'text-primary' },
  menipis: { label: 'Menipis', icon: 'trending_down', text: 'text-secondary' },
  habis: { label: 'Habis', icon: 'cancel', text: 'text-error' },
}
const barClass = { aman: 'bg-primary', menipis: 'bg-secondary', habis: 'bg-error' }

const statusOf = (i) => (i.stock <= 0 ? 'habis' : i.stock < i.min ? 'menipis' : 'aman')

const filtered = computed(() => ingredients.filter((i) => {
  const okStatus = filter.value === 'semua' || i.status === filter.value
  return okStatus && i.name.toLowerCase().includes(search.value.toLowerCase())
}))
const stats = computed(() => ({
  menipis: ingredients.filter((i) => i.status === 'menipis').length,
  habis: ingredients.filter((i) => i.status === 'habis').length,
  aman: ingredients.filter((i) => i.status === 'aman').length,
}))

// Isi bar = stok terhadap minimum. 100% berarti sudah aman.
const fill = (i) => (i.min > 0 ? Math.min(100, Math.round((i.stock / i.min) * 100)) : i.stock > 0 ? 100 : 0)

const stamp = () => {
  const d = new Date()
  return {
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d),
    time: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d),
  }
}

function openDrawer(item = null) {
  editing.value = item
  Object.assign(draft, item
    ? { name: item.name, code: item.code, category: item.category, unit: item.unit, stock: item.stock, min: item.min }
    : blankDraft())
  drawer.value = true
}

function save() {
  if (!draft.name.trim()) return
  const payload = {
    name: draft.name.trim(),
    code: draft.code.trim(),
    category: draft.category,
    unit: draft.unit,
    stock: Number(draft.stock) || 0,
    min: Number(draft.min) || 0,
  }
  const status = statusOf(payload)
  const s = stamp()
  if (editing.value) {
    Object.assign(editing.value, payload, { status, updated: s.date, updatedTime: s.time })
    showToast(`${payload.name} diperbarui`)
  } else {
    ingredients.unshift({ id: Date.now(), status, updated: s.date, updatedTime: s.time, ...payload })
    showToast(`${payload.name} ditambahkan`)
  }
  drawer.value = false
}

function removeItem() {
  const idx = ingredients.indexOf(pendingDelete.value)
  if (idx !== -1) ingredients.splice(idx, 1)
  showToast(`${pendingDelete.value.name} dihapus`)
  pendingDelete.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-headline-xl text-primary">Stok &amp; Bahan</h1>
        <p class="text-body-md text-on-surface-variant">Pantau ketersediaan bahan baku dan kemasan.</p>
      </div>
      <div class="flex w-full gap-2 sm:w-auto">
        <button type="button" class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-surface-container-high px-4 text-label-md text-primary transition-colors hover:bg-surface-container-low sm:flex-none sm:px-5" @click="showToast('Stok berhasil diekspor')">
          <span class="material-symbols-outlined text-[20px]">download</span>Ekspor
        </button>
        <button type="button" class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105 sm:flex-none sm:px-5" @click="openDrawer()">
          <span class="material-symbols-outlined text-[20px]">add</span>Tambah Bahan
        </button>
      </div>
    </header>

    <!-- Angka yang memimpin, tanpa dekorasi -->
    <dl class="grid grid-cols-1 divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest px-2 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Menipis</dt>
        <dd class="numeric mt-0.5 text-headline-xl text-secondary">{{ stats.menipis }}</dd>
        <p class="text-label-sm text-on-surface-variant">di bawah minimum</p>
      </div>
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Habis</dt>
        <dd class="numeric mt-0.5 text-headline-xl text-error">{{ stats.habis }}</dd>
        <p class="text-label-sm text-on-surface-variant">perlu restock</p>
      </div>
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Aman</dt>
        <dd class="numeric mt-0.5 text-headline-xl text-primary">{{ stats.aman }}</dd>
        <p class="text-label-sm text-on-surface-variant">stok cukup</p>
      </div>
    </dl>

    <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1 sm:max-w-xs">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
          <input v-model="search" type="search" placeholder="Cari bahan..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari bahan" />
        </div>
        <div class="flex items-center overflow-x-auto rounded-xl bg-surface-container-low p-1 scrollbar-none">
          <button v-for="s in ['semua', 'aman', 'menipis', 'habis']" :key="s" type="button" class="shrink-0 rounded-lg px-3 py-1.5 text-label-md capitalize transition-colors" :class="filter === s ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="filter = s">{{ s }}</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th class="py-3 pr-3 font-semibold">Bahan</th>
              <th class="px-3 py-3 font-semibold">Kategori</th>
              <th class="px-3 py-3 text-right font-semibold">Stok</th>
              <th class="px-3 py-3 text-right font-semibold">Min.</th>
              <th class="px-3 py-3 font-semibold">Status</th>
              <th class="px-3 py-3 font-semibold">Diperbarui</th>
              <th class="py-3 pl-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in filtered" :key="i.id" class="border-b border-surface-container-low last:border-0">
              <td class="py-3 pr-3"><p class="text-label-md font-semibold text-primary">{{ i.name }}</p><p class="text-label-sm text-on-surface-variant">{{ i.code }}</p></td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ i.category }}</td>
              <td class="px-3 py-3">
                <p class="numeric text-right text-label-numeric-md text-primary">{{ i.stock }} {{ i.unit }}</p>
                <div class="mt-1 ml-auto h-1 w-24 overflow-hidden rounded-full bg-surface-container-high">
                  <div class="h-full rounded-full transition-all" :class="barClass[i.status]" :style="{ width: fill(i) + '%' }"></div>
                </div>
              </td>
              <td class="numeric px-3 py-3 text-right text-body-md text-on-surface-variant">{{ i.min }} {{ i.unit }}</td>
              <td class="px-3 py-3">
                <span class="inline-flex items-center gap-1.5 text-label-md font-medium" :class="statusMeta[i.status].text">
                  <span class="material-symbols-outlined text-[18px]">{{ statusMeta[i.status].icon }}</span>
                  {{ statusMeta[i.status].label }}
                </span>
              </td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ i.updated }}<br /><span class="text-label-sm">{{ i.updatedTime }}</span></td>
              <td class="py-3 pl-3">
                <div class="flex items-center justify-end gap-1">
                  <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Ubah bahan" @click="openDrawer(i)"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  <button type="button" class="rounded-lg p-2 text-error hover:bg-error-container" aria-label="Hapus bahan" @click="pendingDelete = i"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="py-10 text-center text-body-md text-on-surface-variant">Bahan tidak ditemukan.</p>
      </div>
    </div>
  </div>

  <!-- Drawer tambah/ubah bahan -->
  <Transition name="drawer">
    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-primary/40 backdrop-blur-sm" @click.self="drawer = false">
    <aside class="flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="stok-title">
      <header class="flex items-center justify-between border-b border-surface-container-high px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="stok-title" class="text-headline-md text-primary">{{ editing ? 'Ubah Bahan' : 'Tambah Bahan' }}</h2>
          <p class="text-label-sm text-on-surface-variant">Lengkapi detail bahan lalu simpan.</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup" @click="drawer = false"><span class="material-symbols-outlined">close</span></button>
      </header>
      <form class="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-none sm:px-6 sm:py-5" @submit.prevent="save">
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="s-name">Nama Bahan <span class="text-error">*</span></label>
          <input id="s-name" v-model="draft.name" type="text" required class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="s-code">Kode</label>
            <input id="s-code" v-model="draft.code" type="text" placeholder="BHK-0xx" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="s-cat">Kategori</label>
            <SelectField id="s-cat" v-model="draft.category" :options="categoryOptions" aria-label="Kategori bahan" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="s-unit">Satuan</label>
            <SelectField id="s-unit" v-model="draft.unit" :options="unitOptions" aria-label="Satuan bahan" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="s-stock">Stok</label>
            <input id="s-stock" v-model.number="draft.stock" type="number" min="0" step="0.1" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="s-min">Stok Minimum</label>
          <input id="s-min" v-model.number="draft.min" type="number" min="0" step="0.1" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </form>
      <footer class="flex gap-3 border-t border-surface-container-high px-4 py-4 sm:px-6">
        <button type="button" class="flex-1 rounded-xl border border-surface-container-high px-4 py-3 text-label-md text-primary hover:bg-surface-container-low" @click="drawer = false">Batal</button>
        <button type="button" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105" @click="save"><span class="material-symbols-outlined text-[20px]">save</span>Simpan</button>
      </footer>
    </aside>
    </div>
  </Transition>

  <ConfirmDialog v-if="pendingDelete" :title="`Hapus ${pendingDelete.name}?`" message="Bahan akan dihapus dari daftar stok. Tindakan ini tidak bisa dibatalkan." confirm-label="Ya, hapus" @confirm="removeItem" @cancel="pendingDelete = null" />
</template>
