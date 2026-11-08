<script setup>
import { formatCurrency } from '../../lib/format'
import { store } from '../../mocks/data'

defineProps({ receipt: { type: Object, required: true } })
defineEmits(['print', 'new'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-sm">
    <div class="my-auto grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- Summary -->
      <section class="rounded-2xl bg-surface-container-lowest p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <header class="flex items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-primary">
            <span class="material-symbols-outlined text-[24px]">check</span>
          </span>
          <div class="min-w-0">
            <h2 id="success-title" class="text-headline-md text-primary">Pembayaran Berhasil</h2>
            <p class="truncate text-label-sm text-on-surface-variant">{{ receipt.code }} · {{ receipt.orderLabel }}</p>
          </div>
        </header>
        <p class="mt-1 pl-14 text-label-sm text-on-surface-variant">{{ receipt.date }}, {{ receipt.time }} · Kasir {{ receipt.cashier }}</p>

        <div class="mt-5 rounded-2xl bg-surface-container-low px-5 py-4 text-center">
          <p class="text-label-sm uppercase tracking-wider text-on-surface-variant">Total dibayar</p>
          <p class="numeric mt-1 text-headline-xl text-primary">{{ formatCurrency(receipt.total) }}</p>
        </div>

        <dl class="mt-2 divide-y divide-surface-container-high text-body-md">
          <div class="flex items-center justify-between py-2.5">
            <dt class="text-on-surface-variant">Metode</dt>
            <dd class="font-semibold text-primary">{{ receipt.methodLabel }}</dd>
          </div>
          <div v-if="receipt.method === 'cash'" class="flex items-center justify-between py-2.5">
            <dt class="text-on-surface-variant">Uang diterima</dt>
            <dd class="numeric font-semibold text-primary">{{ formatCurrency(receipt.cash) }}</dd>
          </div>
          <div v-if="receipt.method === 'cash'" class="flex items-center justify-between py-2.5">
            <dt class="text-on-surface-variant">Kembalian</dt>
            <dd class="numeric text-headline-sm font-bold text-tertiary">{{ formatCurrency(receipt.change) }}</dd>
          </div>
        </dl>

        <div class="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-surface-container-high px-4 text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-[0.98]" @click="$emit('print')">
            <span class="material-symbols-outlined text-[20px]">print</span>Cetak
          </button>
          <button type="button" class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 text-label-md text-on-secondary-fixed shadow-md transition-all hover:brightness-105 active:scale-[0.98]" @click="$emit('new')">
            <span class="material-symbols-outlined text-[20px]">add</span>Pesanan Baru
          </button>
        </div>
      </section>

      <!-- Receipt 58mm -->
      <section class="receipt mx-auto w-full max-w-[300px] self-start rounded-t-lg bg-white px-5 py-5 font-mono text-[11px] leading-relaxed text-black shadow-2xl">
        <p class="text-center text-[13px] font-bold">*** {{ store.name }} F&amp;B ***</p>
        <p class="text-center">{{ store.address }}</p>
        <p class="text-center">Telp: {{ store.phone }}</p>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <div class="flex justify-between"><span>No: {{ receipt.code }}</span><span>{{ receipt.time }}</span></div>
        <div class="flex justify-between"><span>Kasir: {{ receipt.cashier }}</span><span>{{ receipt.date }}</span></div>
        <div class="flex justify-between"><span>Pesanan</span><span>{{ receipt.orderLabel }}</span></div>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <div v-for="(line, i) in receipt.items" :key="i" class="mb-1">
          <div class="flex justify-between"><span>{{ line.qty }}x {{ line.name }}</span><span class="numeric">{{ formatCurrency(line.total) }}</span></div>
          <p v-if="line.summary" class="text-[10px]">({{ line.summary }})</p>
          <p v-if="line.note" class="italic text-[10px]">* {{ line.note }}</p>
        </div>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <div class="flex justify-between"><span>Subtotal</span><span class="numeric">{{ formatCurrency(receipt.subtotal) }}</span></div>
        <div class="flex justify-between"><span>Diskon Promo</span><span class="numeric">{{ formatCurrency(receipt.discount) }}</span></div>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <div class="flex justify-between text-[13px] font-bold"><span>TOTAL</span><span class="numeric">{{ formatCurrency(receipt.total) }}</span></div>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <div class="flex justify-between"><span>Bayar ({{ receipt.methodLabel }})</span><span class="numeric">{{ formatCurrency(receipt.cash || receipt.total) }}</span></div>
        <div v-if="receipt.method === 'cash'" class="flex justify-between"><span>Kembali</span><span class="numeric">{{ formatCurrency(receipt.change) }}</span></div>
        <template v-if="receipt.orderNote">
          <p class="my-1.5 border-t border-dashed border-black"></p>
          <p>Catatan: {{ receipt.orderNote }}</p>
        </template>
        <p class="my-1.5 border-t border-dashed border-black"></p>
        <p class="text-center">{{ store.footerNote }}</p>
        <p class="text-center">-- WARTIN POS v1.0 --</p>
      </section>

      <!-- Kitchen ticket -->
      <section class="rounded-2xl bg-surface-container-lowest p-4 shadow-2xl sm:p-5">
        <div class="flex items-center gap-2 border-b border-dashed border-surface-container-high pb-3">
          <span class="material-symbols-outlined text-primary">soup_kitchen</span>
          <div>
            <h3 class="text-headline-sm text-primary">Tiket Dapur</h3>
            <p class="text-label-sm text-on-surface-variant">{{ receipt.code }} · {{ receipt.orderLabel }} · {{ receipt.time }}</p>
          </div>
        </div>
        <ul class="mt-3 flex flex-col gap-3">
          <li v-for="(line, i) in receipt.items" :key="i" class="border-b border-surface-container-low pb-2.5 last:border-0">
            <div class="flex items-baseline gap-2">
              <span class="numeric text-headline-sm font-bold text-secondary">{{ line.qty }}×</span>
              <span class="text-label-md font-semibold text-primary">{{ line.name }}</span>
            </div>
            <p v-if="line.summary" class="mt-0.5 pl-7 text-label-sm text-on-surface-variant">{{ line.summary }}</p>
            <p v-if="line.note" class="mt-0.5 pl-7 text-label-sm italic text-error">Catatan: {{ line.note }}</p>
          </li>
        </ul>
        <div v-if="receipt.orderNote" class="mt-3 rounded-xl bg-secondary-fixed/40 p-3">
          <p class="text-label-sm font-bold uppercase tracking-wider text-on-secondary-fixed">Catatan Pesanan</p>
          <p class="text-body-md text-on-surface">{{ receipt.orderNote }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.receipt {
  clip-path: polygon(0 0.5rem, 100% 0, 100% 100%, 0 100%);
}
</style>
