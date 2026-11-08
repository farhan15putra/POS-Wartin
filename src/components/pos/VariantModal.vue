<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { formatCurrency } from '../../lib/format'
import { basePrice } from '../../lib/store'

const props = defineProps({
  item: { type: Object, required: true },
  groups: { type: Array, default: () => [] },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'add'])

const qty = ref(props.initial?.qty || 1)
const note = ref(props.initial?.note || '')
const chosen = reactive({})

const base = computed(() => basePrice(props.item))

props.groups.forEach((group) => {
  const saved = props.initial?.selections?.[group.id]
  if (group.type === 'multi') {
    chosen[group.id] = Array.isArray(saved) ? [...saved] : group.options.filter((o) => o.isDefault).map((o) => o.id)
  } else {
    chosen[group.id] = saved || group.options.find((o) => o.isDefault)?.id || (group.required ? group.options[0]?.id : null)
  }
})

const optionsOf = (group) => group.type === 'multi'
  ? group.options.filter((o) => chosen[group.id].includes(o.id))
  : [group.options.find((o) => o.id === chosen[group.id])].filter(Boolean)

const extra = computed(() => props.groups.reduce((sum, group) => (
  sum + optionsOf(group).reduce((s, o) => s + (Number(o.extraPrice) || 0), 0)
), 0))

const unit = computed(() => base.value + extra.value)
const valid = computed(() => props.groups.every((g) => (
  !g.required || (g.type === 'multi' ? chosen[g.id].length > 0 : Boolean(chosen[g.id]))
)))

function isChosen(group, option) {
  return group.type === 'multi' ? chosen[group.id].includes(option.id) : chosen[group.id] === option.id
}

function toggle(group, option) {
  if (group.type === 'multi') {
    const list = chosen[group.id]
    const i = list.indexOf(option.id)
    if (i === -1) list.push(option.id)
    else list.splice(i, 1)
  } else {
    chosen[group.id] = option.id
  }
}

function confirm() {
  if (!valid.value) return
  const summary = props.groups.flatMap((g) => optionsOf(g)).map((o) => ((Number(o.extraPrice) || 0) > 0 ? `+${o.name}` : o.name)).join(', ')
  const selKey = props.groups.map((g) => `${g.id}:${g.type === 'multi' ? [...chosen[g.id]].sort().join('.') : chosen[g.id]}`).join(';')
  emit('add', {
    qty: qty.value,
    note: note.value.trim(),
    extra: extra.value,
    summary,
    selKey,
    selections: JSON.parse(JSON.stringify(chosen)),
  })
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="$emit('close')">
    <section class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:max-w-[640px] sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="variant-title">
      <header class="flex items-start gap-3 border-b border-surface-container-high px-4 py-4 sm:px-6 sm:py-5">
        <img v-if="item.image" :src="item.image" :alt="item.name" class="h-14 w-14 shrink-0 rounded-xl object-cover" />
        <div class="min-w-0 flex-1">
          <p class="text-label-sm text-on-surface-variant">{{ item.category }}</p>
          <h2 id="variant-title" class="truncate text-headline-md text-primary">{{ item.name }}</h2>
          <p class="numeric text-label-sm text-secondary">
            <span v-if="item.promoPercent" class="mr-1 text-on-surface-variant line-through">{{ formatCurrency(item.price) }}</span>
            {{ formatCurrency(base) }}
          </p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4 scrollbar-none sm:px-6 sm:py-5">
        <fieldset v-for="group in groups" :key="group.id">
          <legend class="mb-2 flex w-full items-center justify-between gap-2">
            <span class="flex items-center gap-2 text-label-md text-primary">
              {{ group.name }}
              <span v-if="group.required" class="rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] text-on-secondary-fixed">Wajib</span>
            </span>
            <span v-if="group.type === 'multi'" class="text-label-sm text-on-surface-variant">Bisa pilih lebih dari satu</span>
          </legend>
          <div class="grid" :class="group.options.length > 2 ? 'grid-cols-2 gap-2 sm:grid-cols-3' : 'grid-cols-2 gap-2'">
            <button
              v-for="option in group.options"
              :key="option.id"
              type="button"
              class="flex min-h-[44px] flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors"
              :class="isChosen(group, option) ? 'border-secondary-container bg-secondary-fixed/40' : 'border-surface-container-high hover:bg-surface-container-low'"
              :aria-pressed="isChosen(group, option)"
              @click="toggle(group, option)"
            >
              <span class="flex w-full items-center justify-between gap-1">
                <span class="text-label-md" :class="isChosen(group, option) ? 'font-semibold text-primary' : 'text-on-surface'">{{ option.name }}</span>
                <span v-if="isChosen(group, option)" class="material-symbols-outlined text-[18px] text-secondary-container">{{ group.type === 'multi' ? 'check_box' : 'check_circle' }}</span>
                <span v-else-if="group.type === 'multi'" class="material-symbols-outlined text-[18px] text-outline-variant">check_box_outline_blank</span>
              </span>
              <span v-if="option.extraPrice > 0" class="numeric text-label-sm font-bold text-secondary">+{{ formatCurrency(option.extraPrice) }}</span>
            </button>
          </div>
        </fieldset>

        <div>
          <label class="mb-1.5 block text-label-md text-primary" for="variant-note">Catatan</label>
          <textarea id="variant-note" v-model="note" rows="3" placeholder="mis. jangan pakai bawang" class="w-full resize-none rounded-xl bg-surface-container-low p-3 text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
        </div>
      </div>

      <footer class="flex flex-col items-stretch gap-3 border-t border-surface-container-high px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <div class="flex items-center gap-1 self-start rounded-xl bg-surface-container-low p-1">
          <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-headline-sm font-bold text-primary hover:bg-surface-container" aria-label="Kurangi jumlah" @click="qty = Math.max(1, qty - 1)">−</button>
          <span class="numeric w-8 text-center text-label-md font-bold">{{ qty }}</span>
          <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-headline-sm font-bold text-primary hover:bg-surface-container" aria-label="Tambah jumlah" @click="qty += 1">+</button>
        </div>
        <button type="button" class="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!valid" @click="confirm">
          <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span class="truncate">Tambah ke Pesanan - {{ formatCurrency(unit * qty) }}</span>
        </button>
      </footer>
    </section>
  </div>
</template>
