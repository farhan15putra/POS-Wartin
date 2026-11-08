<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  selected: { type: String, default: '' },
  tables: { type: Array, required: true },
})
const emit = defineEmits(['select', 'close', 'takeaway'])

const picked = ref(props.selected || '')
const panel = ref(null)

onMounted(() => panel.value?.focus())

function pick(id) {
  picked.value = id
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <section
      ref="panel"
      tabindex="-1"
      class="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-4 shadow-2xl focus:outline-none sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-title"
      @keydown="onKeydown"
    >
      <header class="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 id="table-title" class="text-headline-md text-primary">Pilih Meja</h2>
          <p class="text-label-sm text-on-surface-variant">Tentukan meja pelanggan sebelum pesanan dibuat.</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div class="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p class="text-label-sm font-semibold uppercase tracking-widest text-on-surface-variant">Area Makan</p>
          <div class="flex items-center gap-3 text-label-sm text-on-surface-variant">
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-tertiary-fixed-dim"></span>Kosong</span>
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-secondary-fixed-dim"></span>Terisi</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <button
            v-for="t in tables"
            :key="t.id"
            type="button"
            class="flex min-h-[68px] flex-col items-center justify-center gap-0.5 rounded-t-2xl rounded-b-lg border-2 py-3 transition-colors"
            :class="picked === t.id ? 'border-secondary-container bg-secondary-fixed text-primary' : 'border-surface-container-high bg-surface-container-lowest text-on-surface hover:border-outline hover:bg-surface-container'"
            :aria-pressed="picked === t.id"
            @click="pick(t.id)"
          >
            <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Meja</span>
            <span class="numeric text-headline-md font-bold">{{ t.id }}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest" :class="t.status === 'terisi' ? 'text-secondary' : 'text-tertiary'">{{ t.status === 'terisi' ? 'Terisi' : 'Kosong' }}</span>
          </button>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-surface-container-high px-4 py-2.5 text-label-md text-primary hover:bg-surface-container-low" @click="$emit('takeaway')">
          <span class="material-symbols-outlined text-[18px]">takeout_dining</span>Take Away
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 py-2.5 text-label-md text-on-secondary-fixed shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!picked"
          @click="$emit('select', picked)"
        >
          <span class="material-symbols-outlined text-[20px]">check</span>{{ picked ? `Gunakan Meja ${picked}` : 'Pilih meja' }}
        </button>
      </div>
    </section>
  </div>
</template>