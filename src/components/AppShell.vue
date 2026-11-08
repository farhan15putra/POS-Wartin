<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { route, navigate } from '../lib/router'
import { currentUser, navSections, store } from '../mocks/data'
import { logout, user } from '../lib/store'
import logo from '../assets/without-bg.webp'

const open = ref(false)
const clock = ref('')
let timer

function tick() {
  clock.value = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' WIB'
}

function go(id) {
  navigate(id)
  open.value = false
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 15000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="flex min-h-screen min-w-0 bg-surface">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary text-on-primary transition-[transform,opacity] duration-300 ease-out will-change-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Navigasi utama"
    >
      <div class="px-5 pb-5 pt-5">
        <img :src="logo" :alt="store.name" class="h-auto w-40" />
        <p class="mt-2 text-label-sm font-medium text-on-primary-container">{{ store.tagline }}</p>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-4 scrollbar-none">
        <div v-for="section in navSections" :key="section.label">
          <p class="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-on-primary-container">{{ section.label }}</p>
          <button
            v-for="item in section.items"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-body-md font-medium transition-colors"
            :class="route === item.id ? 'bg-secondary-container font-bold text-on-secondary-container' : 'text-on-primary-container hover:bg-primary-container'"
            @click="go(item.id)"
          >
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </nav>

      <div class="flex items-center gap-3 border-t border-primary-container px-4 py-4">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-on-secondary-container">{{ (user?.initials || currentUser.initials) }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-label-md font-semibold">{{ user?.name || currentUser.name }}</span>
          <span class="block truncate text-label-sm text-on-primary-container">{{ user?.role || currentUser.role }}</span>
        </span>
        <button type="button" class="rounded-lg p-2 text-on-primary-container hover:bg-primary-container" aria-label="Keluar" @click="logout">
          <span class="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </aside>

    <Transition name="scrim">
      <div v-if="open" class="fixed inset-0 z-30 bg-black/40 lg:hidden" @click="open = false"></div>
    </Transition>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <header class="sticky top-0 z-20 flex min-w-0 items-center justify-between gap-3 border-b border-surface-container-high bg-surface-container-lowest px-4 py-3 lg:px-6">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container lg:hidden" aria-label="Buka navigasi" @click="open = true">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <span class="flex min-w-0 items-center gap-2 truncate text-label-sm font-medium text-on-surface-variant">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-tertiary-fixed-dim"></span>
            <span class="truncate">Online · {{ user?.terminal || currentUser.terminal }}</span>
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="hidden items-center gap-1.5 rounded-xl bg-surface-container-low px-3 py-2 text-label-md font-semibold text-on-surface sm:flex">
            <span class="material-symbols-outlined text-[18px] text-outline">schedule</span>
            <span class="numeric">{{ clock }}</span>
          </span>
          <span class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">{{ (user?.initials || currentUser.initials) }}</span>
            <span class="hidden text-left sm:block">
              <span class="block text-label-md font-semibold leading-tight">{{ user?.name || currentUser.name }}</span>
              <span class="block text-label-sm leading-tight text-on-surface-variant">{{ user?.role || currentUser.role }}</span>
            </span>
          </span>
        </div>
      </header>

      <main class="min-w-0 flex-1 px-4 py-5 lg:px-6">
        <slot />
      </main>
    </div>
  </div>
</template>
