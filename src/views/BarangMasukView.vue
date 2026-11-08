<script setup>
import { computed, reactive, ref } from 'vue'
import { incomingGoods } from '../mocks/data'
import { formatCurrency } from '../lib/format'
import { showToast } from '../lib/store'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import SelectField from '../components/ui/SelectField.vue'

const search = ref('')
const filter = ref('semua')
const drawer = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)

const today = () => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
const blankDraft = () => ({ supplier: '', invoice: '', date: today(), items: 1, total: 0, status: 'Diterima' })
const draft = reactive(blankDraft())

const statusMeta = {
  'Diterima': { icon: 'check_circle', text: 'text-secondary' },
  'Menunggu': { icon: 'schedule', text: 'text-primary' },
}
const statusOptions = [
  { value: 'Diterima', label: 'Diterima' },
  { value: 'Menunggu', label: 'Menunggu' },
]

const filtered = computed(() => incomingGoods.filter((g) => {
  const okStatus = filter.value === 'semua' || g.status.toLowerCase() === filter.value
  return okStatus && (g.supplier.toLowerCase().includes(search.value.toLowerCase()) || g.id.toLowerCase().includes(search.value.toLowerCase()))
}))
const stats = computed(() => ({
  count: incomingGoods.length,
  value: incomingGoods.filter((g) => g.status === 'Diterima').reduce((s, g) => s + g.total, 0),
  pending: incomingGoods.filter((g) => g.status === 'Menunggu').length,
}))

const nextId = () => `GRN-${String(Math.max(...incomingGoods.map((g) => Number(String(g.id).replace(/\D/g, '')) || 0)) + 1).padStart(4, '0')}`

function openDrawer(item = null) {
  editing.value = item
  Object.assign(draft, item
    ? { supplier: item.supplier, invoice: item.invoice, date: item.date, items: item.items, total: item.total, status: item.status }
    : blankDraft())
  drawer.value = true
}

function save() {
  if (!draft.supplier.trim()) return
  const payload = {
    supplier: draft.supplier.trim(),
    invoice: draft.invoice.trim(),
    date: draft.date.trim(),
    items: Number(draft.items) || 0,
    total: Number(draft.total) || 0,
    status: draft.status,
  }
  if (editing.value) {
    Object.assign(editing.value, payload)
    showToast(`${editing.value.id} diperbarui`)
  } else {
    incomingGoods.unshift({ id: nextId(), ...payload })
    showToast(`${draft.supplier} dicatat`)
  }
  drawer.value = false
}

function removeItem() {
  const idx = incomingGoods.indexOf(pendingDelete.value)
  if (idx !== -1) incomingGoods.splice(idx, 1)
  showToast(`${pendingDelete.value.id} dihapus`)
  pendingDelete.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-headline-xl text-primary">Barang Masuk</h1>
        <p class="text-body-md text-on-surface-variant">Catat penerimaan barang dari supplier.</p>
      </div>
      <button type="button" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105" @click="openDrawer()">
        <span class="material-symbols-outlined text-[20px]">add</span>Terima Barang
      </button>
    </header>

    <dl class="grid grid-cols-1 divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest px-2 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Nilai diterima</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-secondary">{{ formatCurrency(stats.value) }}</dd>
        <p class="text-label-sm text-on-surface-variant">penerimaan selesai</p>
      </div>
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Total penerimaan</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-primary">{{ stats.count }}</dd>
        <p class="text-label-sm text-on-surface-variant">dokumen tercatat</p>
      </div>
      <div class="px-4 py-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Menunggu</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-primary">{{ stats.pending }}</dd>
        <p class="text-label-sm text-on-surface-variant">belum diterima</p>
      </div>
    </dl>

    <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1 sm:max-w-xs">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
          <input v-model="search" type="search" placeholder="Cari supplier atau nomor..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari barang masuk" />
        </div>
        <div class="flex items-center overflow-x-auto rounded-xl bg-surface-container-low p-1 scrollbar-none">
          <button v-for="s in ['semua', 'diterima', 'menunggu']" :key="s" type="button" class="shrink-0 rounded-lg px-3 py-1.5 text-label-md capitalize transition-colors" :class="filter === s ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="filter = s">{{ s }}</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th class="py-3 pr-3 font-semibold">No. penerimaan</th>
              <th class="px-3 py-3 font-semibold">Tanggal</th>
              <th class="px-3 py-3 font-semibold">Supplier</th>
              <th class="px-3 py-3 text-center font-semibold">Item</th>
              <th class="px-3 py-3 text-right font-semibold">Nilai</th>
              <th class="px-3 py-3 font-semibold">Status</th>
              <th class="py-3 pl-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in filtered" :key="g.id" class="border-b border-surface-container-low last:border-0">
              <td class="py-3 pr-3"><p class="text-label-md font-semibold text-primary">{{ g.id }}</p><p class="text-label-sm text-on-surface-variant">{{ g.invoice }}</p></td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ g.date }}</td>
              <td class="px-3 py-3 text-body-md text-on-surface">{{ g.supplier }}</td>
              <td class="numeric px-3 py-3 text-center text-body-md text-on-surface-variant">{{ g.items }}</td>
              <td class="numeric px-3 py-3 text-right text-label-numeric-md text-primary">{{ formatCurrency(g.total) }}</td>
              <td class="px-3 py-3">
                <span class="inline-flex w-24 items-center justify-start gap-1.5 text-label-md font-medium" :class="statusMeta[g.status].text">
                  <span class="material-symbols-outlined text-[18px]">{{ statusMeta[g.status].icon }}</span>{{ g.status }}
                </span>
              </td>
              <td class="py-3 pl-3">
                <div class="flex items-center justify-end gap-1">
                  <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Ubah penerimaan" @click="openDrawer(g)"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  <button type="button" class="rounded-lg p-2 text-error hover:bg-error-container" aria-label="Hapus penerimaan" @click="pendingDelete = g"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="py-10 text-center text-body-md text-on-surface-variant">Data tidak ditemukan.</p>
      </div>
    </div>
  </div>

  <!-- Drawer terima/ubah barang -->
  <Transition name="drawer">
    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-primary/40 backdrop-blur-sm" @click.self="drawer = false">
    <aside class="flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="grn-title">
      <header class="flex items-center justify-between border-b border-surface-container-high px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="grn-title" class="text-headline-md text-primary">{{ editing ? 'Ubah Penerimaan' : 'Terima Barang' }}</h2>
          <p class="text-label-sm text-on-surface-variant">{{ editing ? editing.id : 'Catat dokumen penerimaan baru.' }}</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup" @click="drawer = false"><span class="material-symbols-outlined">close</span></button>
      </header>
      <form class="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-none sm:px-6 sm:py-5" @submit.prevent="save">
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="g-supplier">Supplier <span class="text-error">*</span></label>
          <input id="g-supplier" v-model="draft.supplier" type="text" required class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="g-invoice">No. Invoice</label>
            <input id="g-invoice" v-model="draft.invoice" type="text" placeholder="INV-2026-1106" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="g-date">Tanggal</label>
            <input id="g-date" v-model="draft.date" type="text" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="g-items">Jumlah Item</label>
            <input id="g-items" v-model.number="draft.items" type="number" min="0" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-label-md text-primary" for="g-total">Nilai (Rp)</label>
            <input id="g-total" v-model.number="draft.total" type="number" min="0" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="g-status">Status</label>
          <SelectField id="g-status" v-model="draft.status" :options="statusOptions" aria-label="Status penerimaan" />
        </div>
      </form>
      <footer class="flex gap-3 border-t border-surface-container-high px-4 py-4 sm:px-6">
        <button type="button" class="flex-1 rounded-xl border border-surface-container-high px-4 py-3 text-label-md text-primary hover:bg-surface-container-low" @click="drawer = false">Batal</button>
        <button type="button" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105" @click="save"><span class="material-symbols-outlined text-[20px]">save</span>Simpan</button>
      </footer>
    </aside>
    </div>
  </Transition>

  <ConfirmDialog v-if="pendingDelete" :title="`Hapus ${pendingDelete.id}?`" message="Dokumen penerimaan akan dihapus. Tindakan ini tidak bisa dibatalkan." confirm-label="Ya, hapus" @confirm="removeItem" @cancel="pendingDelete = null" />
</template>
