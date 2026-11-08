<script setup>
import { computed, reactive, ref } from 'vue'
import { ingredients, opnameSession } from '../mocks/data'
import { showToast } from '../lib/store'

const search = ref('')
const rows = reactive(opnameSession.rows.map((r) => ({ ...r, physical: r.physical })))
const diff = (r) => Number((r.physical - r.system).toFixed(2))
const changed = computed(() => rows.filter((r) => diff(r) !== 0).length)
const filtered = computed(() => rows.filter((r) => `${r.name} ${r.code}`.toLowerCase().includes(search.value.toLowerCase())))

function saveSession() {
  rows.forEach((r) => {
    const ing = ingredients.find((i) => i.code === r.code)
    if (!ing) return
    ing.stock = Number(r.physical) || 0
    ing.status = ing.stock <= 0 ? 'habis' : ing.stock < ing.min ? 'menipis' : 'aman'
  })
  showToast('Sesi opname disimpan, stok diperbarui')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-headline-xl text-primary">Stok Opname</h1>
        <p class="text-body-md text-on-surface-variant">Sesuaikan stok sistem dengan hasil hitung fisik.</p>
      </div>
      <button type="button" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 text-label-md text-on-secondary-fixed shadow-md transition-colors hover:brightness-105" @click="saveSession">
        <span class="material-symbols-outlined text-[20px]">fact_check</span>Simpan Sesi
      </button>
    </header>

    <dl class="grid grid-cols-1 divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest px-2 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div class="px-4 py-3">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Kode sesi</dt>
        <dd class="numeric mt-0.5 text-label-md font-semibold text-primary">{{ opnameSession.code }}</dd>
      </div>
      <div class="px-4 py-3">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Petugas</dt>
        <dd class="mt-0.5 text-label-md font-semibold text-primary">{{ opnameSession.officer }}</dd>
      </div>
      <div class="px-4 py-3">
        <dt class="text-label-sm uppercase tracking-wider text-on-surface-variant">Mulai</dt>
        <dd class="mt-0.5 text-label-md font-semibold text-primary">{{ opnameSession.started }}</dd>
      </div>
    </dl>

    <div class="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1 sm:max-w-xs">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
          <input v-model="search" type="search" placeholder="Cari bahan..." class="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Cari bahan" />
        </div>
        <span class="inline-flex items-center gap-1.5 text-label-sm font-medium" :class="changed ? 'text-secondary' : 'text-on-surface-variant'">
          <span class="material-symbols-outlined text-[16px]">{{ changed ? 'difference' : 'check_circle' }}</span>{{ changed }} selisih
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-container-high text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th class="py-3 pr-3 font-semibold">Bahan</th>
              <th class="px-3 py-3 text-right font-semibold">Stok sistem</th>
              <th class="px-3 py-3 text-right font-semibold">Hitungan fisik</th>
              <th class="px-3 py-3 text-right font-semibold">Selisih</th>
              <th class="py-3 pl-3 font-semibold">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id" class="border-b border-surface-container-low last:border-0">
              <td class="py-3 pr-3"><p class="text-label-md font-semibold text-primary">{{ r.name }}</p><p class="text-label-sm text-on-surface-variant">{{ r.code }} · {{ r.unit }}</p></td>
              <td class="numeric px-3 py-3 text-right text-body-md text-on-surface-variant">{{ r.system }}</td>
              <td class="px-3 py-3 text-right">
                <input v-model.number="r.physical" type="number" step="0.1" min="0" class="numeric h-11 w-28 rounded-lg bg-surface-container-low px-3 text-right text-label-md focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Hitungan fisik" />
              </td>
              <td class="numeric px-3 py-3 text-right text-label-numeric-md" :class="diff(r) === 0 ? 'text-on-surface-variant' : diff(r) < 0 ? 'text-error' : 'text-secondary'">{{ diff(r) > 0 ? `+${diff(r)}` : diff(r) }}</td>
              <td class="py-3 pl-3"><input v-model="r.note" type="text" placeholder="Catatan..." class="h-11 w-full min-w-40 rounded-lg bg-surface-container-low px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" /></td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="py-10 text-center text-body-md text-on-surface-variant">Bahan tidak ditemukan.</p>
      </div>
    </div>
  </div>
</template>
