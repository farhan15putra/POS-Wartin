<script setup>
import { computed, ref } from 'vue'
import { categories, menuItems } from '../mocks/data'
import { showToast } from '../lib/store'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import SelectField from '../components/ui/SelectField.vue'

const search = ref('')
const name = ref('')
const icon = ref('restaurant')
const editing = ref(null)
const pendingDelete = ref(null)

const iconOptions = [
  { value: 'restaurant', label: 'Restoran' },
  { value: 'local_cafe', label: 'Kafe' },
  { value: 'bakery_dining', label: 'Roti & Bakery' },
  { value: 'fastfood', label: 'Cepat Saji' },
  { value: 'icecream', label: 'Es Krim' },
  { value: 'local_pizza', label: 'Pizza' },
]

const cats = computed(() => categories.filter((c) => c.id !== 'semua'))
const filtered = computed(() => cats.value.filter((c) => c.label.toLowerCase().includes(search.value.toLowerCase())))
const count = (id) => menuItems.filter((i) => i.category === id).length

function reset() {
  editing.value = null
  name.value = ''
  icon.value = 'restaurant'
}

function edit(cat) {
  editing.value = cat
  name.value = cat.label
  icon.value = cat.icon
}

function save() {
  const label = name.value.trim()
  if (!label) {
    showToast('Nama kategori wajib diisi')
    return
  }
  if (editing.value) {
    editing.value.label = label
    editing.value.icon = icon.value
    showToast(`${label} diperbarui`)
  } else if (categories.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
    showToast(`${label} sudah ada`)
    return
  } else {
    // sisipkan setelah "Semua Menu" agar langsung terlihat di urutan atas
    categories.splice(1, 0, { id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-3)}`, label, icon: icon.value })
    showToast(`${label} ditambahkan`)
  }
  reset()
}

function removeCat() {
  const idx = categories.indexOf(pendingDelete.value)
  if (idx !== -1) categories.splice(idx, 1)
  showToast(`${pendingDelete.value.label} dihapus`)
  pendingDelete.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header>
      <h1 class="text-headline-xl text-primary">Kategori Menu</h1>
      <p class="text-body-md text-on-surface-variant">Kelompokkan menu agar pencarian di kasir lebih cepat.</p>
    </header>

    <form class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-end" @submit.prevent="save">
      <div class="flex-1">
        <label class="mb-1.5 block text-label-md text-primary" for="cat-name">{{ editing ? 'Ubah Nama Kategori' : 'Nama Kategori Baru' }}</label>
        <input id="cat-name" v-model="name" type="text" required placeholder="Contoh: Paket Hemat" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div class="w-full sm:w-48">
        <label class="mb-1.5 block text-label-md text-primary" for="cat-icon">Ikon</label>
        <SelectField id="cat-icon" v-model="icon" :options="iconOptions" aria-label="Ikon kategori" />
      </div>
      <button type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105">
        <span class="material-symbols-outlined text-[20px]">{{ editing ? 'save' : 'add' }}</span>{{ editing ? 'Perbarui' : 'Tambah' }}
      </button>
      <button v-if="editing" type="button" class="inline-flex h-11 items-center justify-center rounded-xl border border-surface-container-high px-5 text-label-md text-primary hover:bg-surface-container-low" @click="reset">Batal</button>
    </form>

    <div class="relative w-full sm:max-w-xs">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
      <input v-model="search" type="search" placeholder="Cari kategori..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari kategori" />
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="cat in filtered" :key="cat.id" class="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed"><span class="material-symbols-outlined">{{ cat.icon }}</span></span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-headline-sm text-primary">{{ cat.label }}</p>
          <p class="text-label-sm text-on-surface-variant">{{ count(cat.id) }} menu terdaftar</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Ubah kategori" @click="edit(cat)"><span class="material-symbols-outlined text-[18px]">edit</span></button>
        <button type="button" class="rounded-lg p-2 text-error hover:bg-error-container" aria-label="Hapus kategori" @click="pendingDelete = cat"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </article>
      <p v-if="!filtered.length" class="rounded-xl bg-surface-container-low p-10 text-center text-body-md text-on-surface-variant sm:col-span-2 xl:col-span-3">Kategori tidak ditemukan.</p>
    </div>
  </div>

  <ConfirmDialog v-if="pendingDelete" :title="`Hapus ${pendingDelete.label}?`" message="Kategori akan dihapus. Menu pada kategori ini tetap ada namun tanpa kategori." confirm-label="Ya, hapus" @confirm="removeCat" @cancel="pendingDelete = null" />
</template>
