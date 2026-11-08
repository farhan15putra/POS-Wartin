<script setup>
import { computed, reactive, ref } from 'vue'
import { discounts } from '../mocks/data'
import { formatCurrency } from '../lib/format'
import { showToast } from '../lib/store'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import SelectField from '../components/ui/SelectField.vue'

const typeOptions = [
  { value: 'percent', label: 'Persen (%)' },
  { value: 'amount', label: 'Nominal (Rp)' },
]

const rows = ref(discounts.map((d) => ({ ...d })))
const search = ref('')
const pendingDelete = ref(null)
const editing = ref(null)
const showForm = ref(false)
const blankDraft = () => ({ code: '', name: '', type: 'percent', value: 10, scope: 'Semua Menu', min: 0 })
const draft = reactive(blankDraft())

const activeCount = computed(() => rows.value.filter((d) => d.active).length)
const filtered = computed(() => rows.value.filter((d) => `${d.name} ${d.code}`.toLowerCase().includes(search.value.toLowerCase())))

function valueLabel(d) {
  return d.type === 'percent' ? `${d.value}%` : formatCurrency(d.value)
}

function openForm() {
  editing.value = null
  Object.assign(draft, blankDraft())
  showForm.value = true
}

function toggleForm() {
  if (showForm.value) {
    showForm.value = false
    editing.value = null
  } else {
    openForm()
  }
}

function editRow(d) {
  editing.value = d
  Object.assign(draft, { code: d.code, name: d.name, type: d.type, value: d.value, scope: d.scope, min: d.min })
  showForm.value = true
}

function save() {
  if (!draft.code || !draft.name) return
  const payload = { ...draft, value: Number(draft.value), min: Number(draft.min) }
  if (editing.value) {
    Object.assign(editing.value, payload)
    showToast(`${draft.name} diperbarui`)
  } else {
    rows.value.unshift({ id: Date.now(), ...payload, active: true, period: 'Sepanjang waktu', usage: 0 })
    showToast(`${draft.name} dibuat`)
  }
  showForm.value = false
  editing.value = null
  Object.assign(draft, blankDraft())
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-headline-xl text-primary">Diskon &amp; Promo</h1>
        <p class="text-body-md text-on-surface-variant">{{ activeCount }} promo aktif dari {{ rows.length }} total.</p>
      </div>
      <button type="button" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105" @click="toggleForm">
        <span class="material-symbols-outlined text-[20px]">{{ showForm ? 'close' : 'add' }}</span>{{ showForm ? 'Tutup' : 'Buat Promo' }}
      </button>
    </header>

    <form v-if="showForm" class="grid grid-cols-1 gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4" @submit.prevent="save">
      <div><label class="mb-1.5 block text-label-sm text-primary" for="d-code">Kode</label><input id="d-code" v-model="draft.code" type="text" placeholder="PROMO20" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md uppercase focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
      <div><label class="mb-1.5 block text-label-sm text-primary" for="d-name">Nama Promo</label><input id="d-name" v-model="draft.name" type="text" class="h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
      <div><label class="mb-1.5 block text-label-sm text-primary" for="d-type">Tipe</label>
        <SelectField id="d-type" v-model="draft.type" :options="typeOptions" aria-label="Tipe promo" />
      </div>
      <div><label class="mb-1.5 block text-label-sm text-primary" for="d-value">Nilai</label><input id="d-value" v-model.number="draft.value" type="number" min="0" class="numeric h-11 w-full rounded-xl bg-surface-container-low px-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
      <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 py-3 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105 sm:col-span-2 xl:col-span-4"><span class="material-symbols-outlined text-[20px]">save</span>{{ editing ? 'Perbarui Promo' : 'Simpan Promo' }}</button>
    </form>

    <div class="relative w-full sm:max-w-xs">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
      <input v-model="search" type="search" placeholder="Cari promo atau kode..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari promo" />
    </div>

    <TransitionGroup name="list" tag="div" class="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <article v-for="(d, index) in filtered" :key="d.id" :style="{ '--stagger-index': index }" class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-headline-sm text-primary">{{ d.name }}</p>
            <p class="truncate text-label-sm uppercase tracking-wider text-on-surface-variant">{{ d.code }} · {{ d.scope }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container" aria-label="Ubah promo" @click="editRow(d)"><span class="material-symbols-outlined text-[18px]">edit</span></button>
            <button
              type="button"
              role="switch"
              :aria-checked="d.active"
              :aria-label="d.active ? 'Nonaktifkan promo' : 'Aktifkan promo'"
              class="relative mx-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 before:absolute before:-inset-2.5 before:content-[''] motion-reduce:transition-none"
              :class="d.active ? 'bg-secondary-container' : 'bg-surface-container-highest'"
              @click="d.active = !d.active"
            >
              <span
                class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out motion-reduce:transition-none"
                :class="d.active ? 'translate-x-[22px]' : 'translate-x-0.5'"
              ></span>
            </button>
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container" aria-label="Hapus promo" @click="pendingDelete = d"><span class="material-symbols-outlined text-[18px]">delete</span></button>
          </div>
        </div>

        <div class="flex items-end justify-between gap-4 border-y border-surface-container-low py-3">
          <div>
            <p class="text-label-sm text-on-surface-variant">Potongan</p>
            <p class="numeric text-headline-lg text-secondary">{{ valueLabel(d) }}</p>
          </div>
          <dl class="grid grid-cols-1 gap-x-5 text-right sm:grid-cols-2">
            <div><dt class="text-label-sm text-on-surface-variant">Min. belanja</dt><dd class="numeric text-label-md text-primary">{{ d.min ? formatCurrency(d.min) : 'Tanpa minimum' }}</dd></div>
            <div><dt class="text-label-sm text-on-surface-variant">Terpakai</dt><dd class="numeric text-label-md text-primary">{{ d.usage }}×</dd></div>
          </dl>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="flex min-w-0 items-center gap-1.5 text-label-sm text-on-surface-variant"><span class="material-symbols-outlined shrink-0 text-[16px]">event</span><span class="truncate">{{ d.period }}</span></span>
          <span class="inline-flex shrink-0 items-center gap-1.5 text-label-sm font-medium" :class="d.active ? 'text-secondary' : 'text-on-surface-variant'">
            <span class="material-symbols-outlined text-[16px]">{{ d.active ? 'check_circle' : 'cancel' }}</span>{{ d.active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
      </article>
      <p v-if="!filtered.length" key="empty-promo" class="rounded-xl bg-surface-container-low p-10 text-center text-body-md text-on-surface-variant">Promo tidak ditemukan.</p>
    </TransitionGroup>
  </div>

  <ConfirmDialog v-if="pendingDelete" :title="`Hapus ${pendingDelete.name}?`" message="Promo akan dihapus dan tidak bisa dipakai lagi di kasir." confirm-label="Ya, hapus" @confirm="rows = rows.filter((r) => r.id !== pendingDelete.id); showToast('Promo dihapus'); pendingDelete = null" @cancel="pendingDelete = null" />
</template>
