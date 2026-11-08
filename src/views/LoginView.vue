<script setup>
import { ref } from 'vue'
import { navigate } from '../lib/router'
import { login } from '../lib/store'
import { currentUser, store } from '../mocks/data'
import logoWithBg from '../assets/with-bg.webp'

const username = ref('siti.rahma@wartin.pos')
const password = ref('wartin123')
const showPass = ref(false)
const remember = ref(true)
const error = ref('')

function submit() {
  if (!username.value || !password.value) {
    error.value = 'Username atau password salah'
    return
  }
  login({ ...currentUser, name: 'Siti Rahma', role: 'Kasir & Admin', initials: 'SR' })
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-surface lg:flex-row">
    <!-- Brand panel -->
    <section class="relative flex flex-col justify-between overflow-hidden bg-primary p-5 text-on-primary sm:p-12 lg:w-1/2 lg:p-16">
      <img :src="logoWithBg" :alt="store.name" class="h-16 w-auto self-start rounded-xl shadow-lg" />

      <div class="my-10 max-w-lg lg:my-0">
        <div class="mb-8 flex items-center justify-center rounded-2xl border border-primary-container bg-primary-container/50 p-6">
          <svg viewBox="0 0 340 180" class="h-auto w-full max-w-[320px]" fill="none" aria-hidden="true">
            <circle cx="170" cy="90" r="70" fill="var(--color-secondary-container)" fill-opacity="0.12"></circle>
            <g transform="translate(18,30)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
              <path d="M30 65 C 30 38 45 28 62 28 C 79 28 94 38 94 65 Z" fill="currentColor" fill-opacity="0.04"></path>
              <ellipse cx="62" cy="68" rx="46" ry="12" fill="currentColor" fill-opacity="0.06"></ellipse>
              <path d="M22 68 C 22 76 38 82 62 82 C 86 82 102 76 102 68"></path>
            </g>
            <g transform="translate(130,22)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
              <path d="M16 26 H 66 L 60 76 C 59 83 53 88 45 88 H 37 C 29 88 23 83 22 76 L 16 26 Z" fill="currentColor" fill-opacity="0.05"></path>
              <path d="M64 34 C 75 34 78 44 78 51 C 78 59 73 66 62 66" stroke="var(--color-secondary-container)"></path>
              <line x1="6" y1="90" x2="76" y2="90" stroke-linecap="round"></line>
            </g>
            <g transform="translate(230,18)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
              <path d="M12 12 H 72 V 104 L 64 99 L 56 104 L 48 99 L 40 104 L 32 99 L 24 104 L 16 99 L 12 102 V 12 Z" fill="currentColor" fill-opacity="0.07"></path>
              <line x1="20" y1="64" x2="64" y2="64" stroke-dasharray="3 3"></line>
              <rect x="44" y="71" width="18" height="6" rx="2" fill="var(--color-secondary-container)" stroke="none"></rect>
            </g>
          </svg>
        </div>
        <h1 class="mb-3 text-[28px] font-bold leading-tight tracking-tight">Kasir cepat, stok akurat, laporan rapi</h1>
        <p class="max-w-md text-body-lg text-on-primary-container">Satu aplikasi untuk kasir, staf gudang, admin, dan pemilik: transaksi, stok bahan, sampai rekap penjualan harian.</p>
      </div>

      <div class="flex flex-col gap-2 border-t border-primary-container pt-6 text-label-sm text-on-primary-container sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 {{ store.name }}</span>
        <span>{{ store.address }}</span>
      </div>
    </section>

    <!-- Form panel -->
    <section class="flex flex-1 items-center justify-center bg-surface p-6 sm:p-10 lg:p-16">
      <div class="w-full max-w-[460px]">
        <div class="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-lg sm:p-10">
          <div class="mb-7">
            <h2 class="text-[26px] font-bold leading-tight text-primary">Masuk ke {{ store.name }}</h2>
            <p class="mt-1.5 text-body-md text-on-surface-variant">Masukkan email atau username terdaftar, lalu kata sandi Anda.</p>
          </div>

          <form class="space-y-5" @submit.prevent="submit">
            <div>
              <label for="username" class="mb-1.5 block text-label-md font-semibold text-primary">
                Username / Email <span class="text-error">*</span>
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Contoh: kasir01 atau nama@wartin.pos"
                class="h-11 w-full rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 text-body-md text-on-surface shadow-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label for="password" class="mb-1.5 block text-label-md font-semibold text-primary">
                Password <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi"
                  class="h-11 w-full rounded-xl border bg-surface-container-lowest px-4 pr-11 text-body-md text-on-surface shadow-sm focus:outline-none focus:ring-2"
                  :class="error ? 'border-error focus:ring-error/30' : 'border-surface-container-high focus:ring-primary/30'"
                />
                <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-primary" aria-label="Tampilkan atau sembunyikan kata sandi" @click="showPass = !showPass">
                  <span class="material-symbols-outlined text-[20px]">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <p v-if="error" class="mt-2 flex items-center gap-1.5 rounded-lg border border-error/20 bg-error-container/50 px-3 py-2 text-label-sm font-medium text-error" role="alert">
                <span class="material-symbols-outlined text-[16px]">error</span>{{ error }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-0.5">
              <label class="flex cursor-pointer select-none items-center gap-2">
                <input v-model="remember" type="checkbox" class="h-4 w-4 rounded accent-secondary-container" />
                <span class="text-label-sm font-medium text-on-surface-variant">Ingat perangkat ini</span>
              </label>
              <button type="button" class="rounded px-1 py-0.5 text-label-sm font-semibold text-secondary hover:underline" @click="navigate('lupa-password')">Lupa password?</button>
            </div>

            <button type="submit" class="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-base font-semibold text-on-secondary-fixed shadow-md transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-secondary-container focus:ring-offset-2">
              Masuk
              <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <p class="mt-8 border-t border-surface-container-high pt-6 text-body-sm text-on-surface-variant">
            Kasir, admin, gudang, dan pemilik memakai akun yang sama, dibedakan oleh role. Hubungi admin toko bila kredensial Anda bermasalah.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>