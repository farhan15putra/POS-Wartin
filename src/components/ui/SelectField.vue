<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  id: { type: String, default: 'select' },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const active = ref(0)
const trigger = ref(null)

const selected = computed(() => props.options.find((o) => o.value === props.modelValue) || props.options[0])

function openList() {
  open.value = true
  const i = props.options.findIndex((o) => o.value === props.modelValue)
  active.value = i < 0 ? 0 : i
}

function choose(value) {
  emit('update:modelValue', value)
  open.value = false
  trigger.value?.focus()
}

function onKeydown(event) {
  const last = props.options.length - 1
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) return openList()
    active.value = event.key === 'ArrowDown' ? (active.value === last ? 0 : active.value + 1) : (active.value === 0 ? last : active.value - 1)
    nextTick(() => document.getElementById(`${props.id}-opt-${active.value}`)?.scrollIntoView({ block: 'nearest' }))
  } else if (open.value && event.key === 'Home') {
    event.preventDefault()
    active.value = 0
  } else if (open.value && event.key === 'End') {
    event.preventDefault()
    active.value = last
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!open.value) return openList()
    choose(props.options[active.value].value)
  } else if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="relative" @focusout="(e) => { if (!e.currentTarget.contains(e.relatedTarget)) open = false }">
    <button
      ref="trigger"
      :id="id"
      type="button"
      class="flex h-11 w-full items-center justify-between gap-2 rounded-xl bg-surface-container-low pl-4 pr-3 text-left text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
      :aria-label="ariaLabel || undefined"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      @click="open ? (open = false) : openList()"
      @keydown="onKeydown"
    >
      <span class="truncate">{{ selected?.label }}</span>
      <span class="material-symbols-outlined text-[20px] text-outline transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true">expand_more</span>
    </button>
    <ul
      v-if="open"
      :id="`${id}-list`"
      role="listbox"
      :aria-labelledby="id"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-surface-container-high bg-surface-container-lowest p-1 shadow-lg scrollbar-none"
    >
      <li
        v-for="(opt, i) in options"
        :id="`${id}-opt-${i}`"
        :key="opt.value"
        role="option"
        :aria-selected="opt.value === modelValue"
        class="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-body-md"
        :class="i === active ? 'bg-surface-container-low' : ''"
        @click="choose(opt.value)"
        @mousedown.prevent
        @mouseenter="active = i"
      >
        <span :class="opt.value === modelValue ? 'font-semibold text-primary' : 'text-on-surface'">{{ opt.label }}</span>
        <span v-if="opt.value === modelValue" class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">check</span>
      </li>
    </ul>
  </div>
</template>
