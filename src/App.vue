<script setup>
import { computed } from 'vue'
import { route, navigate } from './lib/router'
import { user, toast } from './lib/store'
import AppShell from './components/AppShell.vue'
import LoginView from './views/LoginView.vue'
import ForgotView from './views/ForgotView.vue'
import KasirView from './views/KasirView.vue'
import MenuAdminView from './views/MenuAdminView.vue'
import KategoriView from './views/KategoriView.vue'
import DiskonView from './views/DiskonView.vue'
import RiwayatView from './views/RiwayatView.vue'
import StokBahanView from './views/StokBahanView.vue'
import StokOpnameView from './views/StokOpnameView.vue'
import BarangMasukView from './views/BarangMasukView.vue'
import PlaceholderView from './views/PlaceholderView.vue'

const views = {
  kasir: KasirView,
  menu: MenuAdminView,
  kategori: KategoriView,
  diskon: DiskonView,
  riwayat: RiwayatView,
  stok: StokBahanView,
  'barang-masuk': BarangMasukView,
  'stok-opname': StokOpnameView,
}

const currentView = computed(() => views[route.value] || PlaceholderView)
</script>

<template>
  <template v-if="!user">
    <ForgotView v-if="route === 'lupa-password'" />
    <LoginView v-else />
  </template>
  <AppShell v-else>
    <Transition name="view" mode="out-in">
      <component :is="currentView" :key="route" @navigate="navigate" />
    </Transition>
  </AppShell>

  <div
    v-if="toast"
    class="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-primary px-4 py-2.5 text-body-md text-on-primary shadow-lg"
    role="status"
  >{{ toast }}</div>
</template>
