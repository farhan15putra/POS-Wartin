<script setup>
import { route } from '../lib/router'

const titles = {
  dashboard: 'Dashboard', laporan: 'Laporan', akun: 'Akun & Hak Akses', pengaturan: 'Pengaturan Toko', 'riwayat-saya': 'Riwayat Saya',
}
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
    <span class="material-symbols-outlined text-[48px] text-outline">construction</span>
    <h1 class="mt-4 text-headline-xl text-primary">{{ titles[route] || 'Halaman' }}</h1>
    <p class="mt-1 max-w-md text-body-md text-on-surface-variant">Halaman ini belum tersedia. Pilih menu lain dari sidebar untuk melanjutkan.</p>
  </div>
</template>
