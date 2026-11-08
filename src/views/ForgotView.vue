<script setup>
import { computed, ref } from 'vue'
import { navigate } from '../lib/router'
import logo from '../assets/without-bg.webp'

const step = ref(1)
const email = ref('siti.rahma@wartin.pos')
const password = ref('KopiWartin2026!')
const confirm = ref('KopiWartin2026!')
const show1 = ref(false)
const show2 = ref(false)

const length = computed(() => password.value.length)
const checks = computed(() => [
  { label: `Minimal 8 karakter (terisi ${length.value} karakter)`, ok: length.value >= 8 },
  { label: 'Mengandung kombinasi huruf besar, kecil & angka', ok: /[A-Z]/.test(password.value) && /[a-z]/.test(password.value) && /\d/.test(password.value) },
  { label: 'Mengandung simbol atau karakter khusus (!)', ok: /[^A-Za-z0-9]/.test(password.value) },
])
const matched = computed(() => password.value.length > 0 && password.value === confirm.value)
</script>

<template>
  <main class="flex min-h-screen flex-col items-center bg-surface px-4 py-10 sm:px-6">
    <header class="mb-8 flex w-full max-w-2xl flex-col items-center text-center">
      <img :src="logo" alt="SOKIN WARTIN" class="mb-3 h-auto w-48" />
      <p class="max-w-md text-body-md text-on-surface-variant">Point of Sale &amp; Manajemen Usaha F&amp;B</p>
    </header>

    <div class="flex w-full max-w-2xl flex-col gap-6">
      <!-- Step 1 -->
      <section class="flex flex-col rounded-2xl bg-surface-container-lowest p-4 shadow-md sm:p-8">
        <p class="mb-4 text-label-sm text-on-surface-variant">Langkah 1 dari 2</p>
        <h1 class="mb-2 text-headline-lg text-primary-container">Lupa Password?</h1>
        <p class="mb-6 text-body-md leading-relaxed text-on-surface-variant">Masukkan email terdaftar akun WARTIN Anda. Kami akan mengirimkan tautan verifikasi untuk mengatur ulang kata sandi.</p>
        <form class="flex flex-col gap-4" @submit.prevent="step = 2">
          <div>
            <label class="mb-1.5 block text-label-md text-primary-container" for="email-input">Email Akun <span class="text-error">*</span></label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant">alternate_email</span>
              <input id="email-input" v-model="email" type="email" placeholder="contoh: kasir@wartin.pos" class="h-11 w-full rounded-xl bg-surface-container-lowest pl-11 pr-4 text-body-md text-on-surface shadow-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-surface-container-low p-3.5">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-secondary">schedule</span>
            <p class="text-body-sm leading-relaxed text-on-surface-variant">Tautan reset berlaku selama <strong class="font-semibold text-primary-container">15 menit</strong> demi keamanan akun kasir &amp; terminal operasional.</p>
          </div>
          <button type="submit" class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-md text-on-secondary-fixed shadow-sm transition-all hover:bg-secondary active:scale-[0.98]">
            <span>Kirim Tautan Reset</span>
            <span class="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
        <div class="mt-6 flex items-center justify-center border-t border-surface-container-highest pt-5">
          <button type="button" class="inline-flex items-center gap-1.5 text-label-md text-primary-container hover:text-secondary hover:underline" @click="navigate('login')">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke halaman login</span>
          </button>
        </div>
      </section>

      <!-- Step 2 -->
      <section v-if="step === 2" class="flex flex-col rounded-2xl bg-surface-container-lowest p-6 shadow-md sm:p-8">
        <p class="mb-4 text-label-sm text-on-surface-variant">Langkah 2 dari 2</p>
        <h2 class="mb-2 text-headline-lg text-primary-container">Buat Password Baru</h2>
        <p class="mb-6 text-body-md leading-relaxed text-on-surface-variant">Token verifikasi valid untuk <strong class="font-semibold text-primary-container">{{ email }}</strong>. Silakan buat password baru yang kuat.</p>
        <form class="flex flex-col gap-5" @submit.prevent="navigate('login')">
          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="block text-label-md text-primary-container" for="new-password">Password Baru <span class="text-error">*</span></label>
              <span class="text-label-sm font-medium text-tertiary">{{ checks.every((c) => c.ok) ? 'Sangat Kuat' : 'Perlu diperkuat' }}</span>
            </div>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant">lock</span>
              <input id="new-password" v-model="password" :type="show1 ? 'text' : 'password'" class="h-11 w-full rounded-xl bg-surface-container-lowest py-0 pl-11 pr-11 text-body-md text-on-surface shadow-sm focus:outline-none focus:bg-surface-bright" />
              <button type="button" class="absolute right-3 flex items-center justify-center p-1 text-on-surface-variant hover:text-primary" aria-label="Toggle password visibility" @click="show1 = !show1">
                <span class="material-symbols-outlined text-[20px]">{{ show1 ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="mt-2.5 flex items-center gap-1.5" aria-label="Kekuatan password">
              <div v-for="n in 3" :key="n" class="h-1.5 flex-1 rounded-full" :class="checks[n - 1].ok ? 'bg-tertiary-container' : 'bg-surface-container-highest'"></div>
            </div>
            <div class="mt-3 flex flex-col gap-1.5 rounded-xl bg-surface-container-low p-3">
              <div v-for="check in checks" :key="check.label" class="flex items-center gap-2 text-label-sm" :class="check.ok ? 'text-tertiary' : 'text-on-surface-variant'">
                <span class="material-symbols-outlined text-[16px]">{{ check.ok ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>{{ check.label }}</span>
              </div>
            </div>
          </div>
          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="block text-label-md text-primary-container" for="confirm-password">Konfirmasi Password Baru <span class="text-error">*</span></label>
              <span v-if="matched" class="inline-flex items-center gap-1 text-label-sm text-tertiary">
                <span class="material-symbols-outlined text-[14px]">done_all</span>Password cocok
              </span>
            </div>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant">lock_clock</span>
              <input id="confirm-password" v-model="confirm" :type="show2 ? 'text' : 'password'" class="h-11 w-full rounded-xl bg-surface-container-lowest pl-11 pr-11 text-body-md text-on-surface shadow-sm focus:outline-none focus:bg-surface-bright" />
              <button type="button" class="absolute right-3 flex items-center justify-center p-1 text-on-surface-variant hover:text-primary" aria-label="Toggle confirm password visibility" @click="show2 = !show2">
                <span class="material-symbols-outlined text-[20px]">{{ show2 ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-surface-container-low p-3.5">
            <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary-container">info</span>
            <p class="text-body-sm leading-relaxed text-on-surface-variant">Setelah disimpan, Anda akan diarahkan otomatis ke halaman login untuk masuk kembali dengan kredensial baru.</p>
          </div>
          <button type="submit" class="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-container text-label-md text-on-secondary-fixed shadow-sm transition-all hover:bg-secondary active:scale-[0.98]">
            <span class="material-symbols-outlined text-[20px]">save</span>
            <span>Simpan Password</span>
          </button>
        </form>
      </section>
    </div>

    <footer class="mt-8 w-full max-w-2xl border-t border-surface-container-highest pt-4 text-center text-body-sm text-on-surface-variant">
      © 2026 SOKIN WARTIN F&amp;B POS
    </footer>
  </main>
</template>
