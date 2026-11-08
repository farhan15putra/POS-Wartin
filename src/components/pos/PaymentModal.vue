<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { formatCurrency } from '../../lib/format'

const props = defineProps({
  method: { type: String, required: true },
  total: { type: Number, required: true },
  orderCode: { type: String, default: '' },
  table: { type: String, default: '' },
  cashier: { type: String, default: '' },
  itemCount: { type: Number, default: 0 },
  cashReceived: { type: String, default: '' },
  change: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'finish', 'update:cash'])

const titles = { cash: 'Pembayaran Tunai', qris: 'Pembayaran QRIS' }
const icons = { cash: 'payments', qris: 'qr_code_scanner' }

const received = computed(() => Number(props.cashReceived || 0))
const enough = computed(() => received.value >= props.total)
const shortfall = computed(() => Math.max(0, props.total - received.value))
const quick = computed(() => (
  [...new Set([props.total, 20000, 50000, 100000])].filter((v) => v >= props.total)
))

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="$emit('close')">
    <section class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:max-w-[480px] sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="pay-title">
      <header class="flex items-start gap-3 border-b border-surface-container-high px-4 py-4 sm:px-5">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
          <span class="material-symbols-outlined text-[22px]">{{ icons[method] }}</span>
        </span>
        <div class="min-w-0 flex-1">
          <h2 id="pay-title" class="text-headline-sm text-primary">{{ titles[method] }}</h2>
          <p class="truncate text-label-sm text-on-surface-variant">{{ orderCode }} · {{ table }}</p>
        </div>
        <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container" aria-label="Tutup" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div class="flex flex-col gap-5 overflow-y-auto px-4 py-4 scrollbar-none sm:px-5 sm:py-5">
        <!-- The number leads -->
        <div class="rounded-2xl bg-surface-container-low px-5 py-4 text-center">
          <p class="text-label-sm uppercase tracking-wider text-on-surface-variant">Total tagihan · {{ itemCount }} item</p>
          <p class="numeric mt-1 text-headline-xl text-primary">{{ formatCurrency(total) }}</p>
        </div>

        <!-- CASH -->
        <template v-if="method === 'cash'">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-label-md text-on-surface" for="cash-input">Uang diterima</label>
              <span v-if="received > 0 && !enough" class="numeric text-label-sm font-semibold text-error">Kurang {{ formatCurrency(shortfall) }}</span>
              <span v-else-if="received > 0" class="numeric text-label-sm font-semibold text-tertiary">Kembalian {{ formatCurrency(change) }}</span>
            </div>
            <div class="flex items-center gap-2 rounded-xl border-2 bg-surface-container-lowest px-4 transition-colors" :class="received > 0 && !enough ? 'border-error' : 'border-outline-variant focus-within:border-primary'">
              <span class="text-headline-md font-bold text-outline">Rp</span>
              <input
                id="cash-input"
                type="number"
                min="0"
                inputmode="numeric"
                placeholder="0"
                class="numeric h-12 w-full bg-transparent text-right text-headline-lg font-bold text-primary focus:outline-none"
                :value="cashReceived"
                @input="$emit('update:cash', $event.target.value)"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <p class="text-label-sm uppercase tracking-wider text-on-surface-variant">Nominal cepat</p>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                v-for="amount in quick"
                :key="amount"
                type="button"
                class="flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-label-sm font-semibold leading-tight transition-colors"
                :class="received === amount ? 'border-primary bg-primary text-on-primary' : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'"
                @click="$emit('update:cash', amount)"
              >
                <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">{{ amount === total ? 'Uang pas' : 'Nominal' }}</span>
                <span class="numeric">{{ formatCurrency(amount) }}</span>
              </button>
            </div>
          </div>
        </template>

        <!-- QRIS -->
        <template v-else>
          <div class="flex flex-col items-center gap-3">
            <div class="grid h-52 w-52 grid-cols-7 grid-rows-7 gap-0.5 rounded-xl bg-white p-3 shadow-inner ring-1 ring-surface-container-high" aria-label="Kode QRIS placeholder">
              <span v-for="n in 49" :key="n" class="rounded-[1px]" :class="(n * 7) % 3 === 0 || n % 5 === 0 ? 'bg-primary' : 'bg-transparent'"></span>
            </div>
            <p class="text-label-md text-on-surface-variant">Pindai dengan aplikasi bank atau e-wallet</p>
            <div class="flex w-full items-center justify-between rounded-xl bg-surface-container-low px-4 py-2.5 text-label-sm">
              <span class="text-on-surface-variant">Status</span>
              <span class="flex items-center gap-1.5 font-semibold text-secondary">
                <span class="h-2 w-2 rounded-full bg-secondary"></span>Menunggu pembayaran
              </span>
            </div>
          </div>
        </template>
      </div>

      <footer class="grid grid-cols-1 gap-2 border-t border-surface-container-high px-5 py-4 sm:grid-cols-[auto_1fr]">
        <button type="button" class="min-h-[44px] rounded-xl border border-surface-container-high px-5 text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-[0.98]" @click="$emit('close')">Batal</button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 text-label-md text-on-secondary-fixed shadow-md transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="method === 'cash' && !enough"
          @click="$emit('finish')"
        >
          <span class="material-symbols-outlined text-[20px]">{{ method === 'cash' ? 'check_circle' : 'verified' }}</span>
          Konfirmasi Pembayaran
        </button>
      </footer>
    </section>
  </div>
</template>
