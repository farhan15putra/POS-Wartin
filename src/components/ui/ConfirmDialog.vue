<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Ya, lanjutkan' },
  danger: { type: Boolean, default: true },
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="fixed inset-0 z-[55] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm" @click.self="$emit('cancel')">
    <section class="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-4 text-center shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="danger ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed'">
        <span class="material-symbols-outlined">{{ danger ? 'warning' : 'help' }}</span>
      </span>
      <h2 id="confirm-title" class="mt-3 text-headline-sm text-primary">{{ title }}</h2>
      <p class="mt-1 text-body-md text-on-surface-variant">{{ message }}</p>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
        <button type="button" class="flex-1 rounded-xl px-4 py-3 text-label-md text-on-error shadow-md" :class="danger ? 'bg-error' : 'bg-secondary-container text-on-secondary-fixed'" @click="$emit('confirm')">{{ confirmLabel }}</button>
        <button type="button" class="flex-1 rounded-xl border border-surface-container-high px-4 py-3 text-label-md text-primary hover:bg-surface-container-low" @click="$emit('cancel')">Batal</button>
      </div>
    </section>
  </div>
</template>
