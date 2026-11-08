<script setup>
import { computed, ref } from 'vue'
import { transactions } from '../mocks/data'
import { formatCurrency } from '../lib/format'
import { showToast } from '../lib/store'

const rows = ref(transactions.map((t) => ({ ...t })))
const search = ref('')
const statusFilter = ref('semua')
const detail = ref(null)
const voidReason = ref('')

const statusMeta = {
  'Lunas': { label: 'Lunas', text: 'text-secondary' },
  'Belum Lunas': { label: 'Belum lunas', text: 'text-primary' },
  'Dibatalkan': { label: 'Dibatalkan', text: 'text-error' },
}
const statusKey = (s) => (s === 'Lunas' ? 'lunas' : s === 'Belum Lunas' ? 'belum' : 'batal')
const meta = (s) => statusMeta[s] || statusMeta['Belum Lunas']
const statusDesc = {
  'Lunas': 'Pembayaran sudah diterima.',
  'Belum Lunas': 'Menunggu pembayaran pelanggan.',
  'Dibatalkan': 'Transaksi dibatalkan dan tidak dihitung.',
}
const stepIcons = ['receipt_long', 'payments', 'check_circle']
const reached = (s) => (s === 'Lunas' ? 3 : s === 'Belum Lunas' ? 2 : 1)
const isCancelNode = (s, i) => s === 'Dibatalkan' && i === 1
const nodeClass = (s, i) => (isCancelNode(s, i)
  ? 'bg-error text-on-error'
  : i < reached(s) ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-primary-container text-on-primary-container')
const barClass = (s, i) => (s === 'Dibatalkan'
  ? (i === 0 ? 'bg-error/40' : 'bg-primary-container')
  : i < reached(s) - 1 ? 'bg-secondary-container' : 'bg-primary-container')
const stepIcon = (s, i) => (isCancelNode(s, i) ? 'cancel' : stepIcons[i])
const dotClass = (s, n) => (s === 'Dibatalkan'
  ? (n === 1 ? 'bg-secondary-container text-on-secondary-fixed' : n === 2 ? 'bg-error text-on-error' : 'bg-surface-container-highest text-on-surface-variant')
  : n <= reached(s) ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container-highest text-on-surface-variant')
const segClass = (s, n) => (s === 'Dibatalkan'
  ? (n === 1 ? 'bg-error/40' : 'bg-surface-container-high')
  : n < reached(s) ? 'bg-secondary-container' : 'bg-surface-container-high')
const filters = [
  { id: 'semua', label: 'Semua' },
  { id: 'lunas', label: 'Lunas' },
  { id: 'belum', label: 'Belum lunas' },
  { id: 'batal', label: 'Dibatalkan' },
]

const filtered = computed(() => rows.value.filter((t) => {
  const okStatus = statusFilter.value === 'semua' || statusKey(t.status) === statusFilter.value
  return okStatus && t.id.toLowerCase().includes(search.value.toLowerCase())
}))
const summary = computed(() => {
  const lunas = rows.value.filter((t) => t.status === 'Lunas')
  return {
    lunas: lunas.length,
    revenue: lunas.reduce((s, t) => s + t.total, 0),
    unpaid: rows.value.filter((t) => t.status === 'Belum Lunas').length,
    canceled: rows.value.filter((t) => t.status === 'Dibatalkan').length,
  }
})

function doVoid() {
  detail.value.status = 'Dibatalkan'
  showToast(`${detail.value.id} dibatalkan${voidReason.value ? `: ${voidReason.value}` : ''}`)
  detail.value = null
  voidReason.value = ''
}

function markPaid() {
  detail.value.status = 'Lunas'
  showToast(`${detail.value.id} ditandai lunas`)
  detail.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header>
      <h1 class="text-headline-xl text-primary">Riwayat Transaksi</h1>
      <p class="text-body-md text-on-surface-variant">Pantau penjualan harian dan proses pembatalan bila perlu.</p>
    </header>

    <dl class="grid grid-cols-1 divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest shadow-sm sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
      <div class="p-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Pendapatan</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-primary">{{ formatCurrency(summary.revenue) }}</dd>
        <p class="text-label-sm text-on-surface-variant">dari transaksi lunas</p>
      </div>
      <div class="p-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Lunas</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-secondary">{{ summary.lunas }}</dd>
        <p class="text-label-sm text-on-surface-variant">sudah dibayar</p>
      </div>
      <div class="p-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Belum lunas</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-primary">{{ summary.unpaid }}</dd>
        <p class="text-label-sm text-on-surface-variant">menunggu pembayaran</p>
      </div>
      <div class="p-4">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Dibatalkan</dt>
        <dd class="numeric mt-0.5 text-headline-lg text-error">{{ summary.canceled }}</dd>
        <p class="text-label-sm text-on-surface-variant">tidak dihitung</p>
      </div>
    </dl>

    <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1 sm:max-w-xs">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
          <input v-model="search" type="search" placeholder="Cari ID transaksi..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari transaksi" />
        </div>
        <div class="flex items-center overflow-x-auto rounded-xl bg-surface-container-low p-1 scrollbar-none">
          <button v-for="f in filters" :key="f.id" type="button" class="shrink-0 rounded-lg px-3 py-1.5 text-label-md transition-colors" :class="statusFilter === f.id ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="statusFilter = f.id">{{ f.label }}</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th class="py-3 pr-3 font-semibold">ID</th><th class="px-3 py-3 font-semibold">Waktu</th><th class="px-3 py-3 font-semibold">Pelanggan</th><th class="px-3 py-3 font-semibold">Kasir</th><th class="px-3 py-3 font-semibold">Metode</th><th class="px-3 py-3 text-right font-semibold">Total</th><th class="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filtered" :key="t.id" class="cursor-pointer border-b border-surface-container-low hover:bg-surface-container-low/60" @click="detail = t">
              <td class="py-3 pr-3 text-label-md font-semibold text-primary">{{ t.id }}</td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ t.date }}<br /><span class="text-label-sm">{{ t.time }}</span></td>
              <td class="px-3 py-3 text-body-md text-on-surface">{{ t.customer }}</td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ t.cashier }}</td>
              <td class="px-3 py-3 text-body-md text-on-surface-variant">{{ t.method }}</td>
              <td class="numeric px-3 py-3 text-right text-label-numeric-md text-primary">{{ formatCurrency(t.total) }}</td>
              <td class="px-3 py-3">
                <span class="flex items-center justify-start gap-2">
                  <span class="flex w-20 shrink-0 items-center justify-start" aria-hidden="true">
                    <template v-for="n in 3" :key="n">
                      <span class="flex h-5 w-5 items-center justify-center rounded-full" :class="dotClass(t.status, n)">
                        <span class="material-symbols-outlined text-[12px]">{{ stepIcon(t.status, n - 1) }}</span>
                      </span>
                      <span v-if="n < 3" class="h-0.5 w-2.5" :class="segClass(t.status, n)"></span>
                    </template>
                  </span>
                  <span class="w-24 shrink-0 text-left text-label-md font-semibold" :class="meta(t.status).text">{{ meta(t.status).label }}</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="py-10 text-center text-body-md text-on-surface-variant">Transaksi tidak ditemukan.</p>
      </div>
    </div>
  </div>

  <!-- Detail transaksi + pembatalan -->
  <Transition name="drawer">
    <div v-if="detail" class="fixed inset-0 z-50 flex justify-end bg-primary/40 backdrop-blur-sm" @click.self="detail = null">
    <aside class="flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="trx-title">
      <header class="flex items-start justify-between gap-3 border-b border-surface-container-high px-4 py-4 sm:px-6 sm:py-5">
        <div class="min-w-0">
          <h2 id="trx-title" class="text-headline-md text-primary">{{ detail.id }}</h2>
          <p class="truncate text-label-sm text-on-surface-variant">{{ detail.date }} · {{ detail.time }}</p>
        </div>
        <button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container" aria-label="Tutup" @click="detail = null"><span class="material-symbols-outlined">close</span></button>
      </header>
      <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4 scrollbar-none sm:px-6 sm:py-5">
        <!-- Total yang memimpin -->
        <div class="rounded-2xl bg-surface-container-low px-5 py-5">
          <p class="text-headline-md text-primary">{{ meta(detail.status).label }}</p>
          <p class="mt-0.5 text-body-md text-on-surface-variant">{{ statusDesc[detail.status] }}</p>

          <div class="mt-4 flex items-center rounded-full bg-primary px-3 py-3">
            <template v-for="(step, i) in stepIcons" :key="step">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="nodeClass(detail.status, i)">
                <span class="material-symbols-outlined text-[18px]">{{ stepIcon(detail.status, i) }}</span>
              </span>
              <span v-if="i < 2" class="h-1 flex-1 rounded-full" :class="barClass(detail.status, i)"></span>
            </template>
          </div>

          <p class="mt-4 text-label-sm text-on-surface-variant">Total transaksi</p>
          <p class="numeric mt-0.5 text-headline-xl text-primary">{{ formatCurrency(detail.total) }}</p>
        </div>

        <dl class="divide-y divide-surface-container-high text-body-md">
          <div class="flex items-center justify-between gap-3 py-2.5"><dt class="text-on-surface-variant">Pelanggan</dt><dd class="text-right font-semibold text-primary">{{ detail.customer }}</dd></div>
          <div class="flex items-center justify-between gap-3 py-2.5"><dt class="text-on-surface-variant">Metode</dt><dd class="text-right font-semibold text-primary">{{ detail.method }}</dd></div>
          <div class="flex items-center justify-between gap-3 py-2.5"><dt class="text-on-surface-variant">Jumlah item</dt><dd class="numeric text-right font-semibold text-primary">{{ detail.items }}</dd></div>
          <div class="flex items-center justify-between gap-3 py-2.5"><dt class="text-on-surface-variant">Kasir</dt><dd class="text-right font-semibold text-primary">{{ detail.cashier }}</dd></div>
        </dl>

        <div v-if="detail.status === 'Belum Lunas'" class="flex flex-col gap-2 rounded-xl border border-secondary/20 bg-secondary-fixed/30 p-4">
          <p class="flex items-center gap-1.5 text-label-md font-semibold text-on-secondary-fixed"><span class="material-symbols-outlined text-[18px]">schedule</span>Menunggu pembayaran</p>
          <button type="button" class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105" @click="markPaid">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>Tandai Lunas
          </button>
        </div>

        <div v-if="detail.status !== 'Dibatalkan'" class="rounded-xl border border-error/20 bg-error-container/30 p-4">
          <p class="mb-2 flex items-center gap-1.5 text-label-md font-semibold text-on-error-container"><span class="material-symbols-outlined text-[18px]">warning</span>Batalkan transaksi</p>
          <label class="mb-1.5 block text-label-sm text-on-surface-variant" for="void-reason">Alasan pembatalan</label>
          <textarea id="void-reason" v-model="voidReason" rows="2" placeholder="Contoh: salah input pesanan" class="w-full resize-none rounded-lg bg-surface-container-lowest p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-error/30"></textarea>
          <button type="button" class="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-error text-label-md text-on-error shadow-md transition-colors hover:brightness-110" @click="doVoid">Batalkan Transaksi</button>
        </div>
        <p v-else class="rounded-xl bg-surface-container-low p-4 text-label-md text-on-surface-variant">Transaksi ini dibatalkan dan tidak dihitung dalam pendapatan.</p>
      </div>
    </aside>
    </div>
  </Transition>
</template>
