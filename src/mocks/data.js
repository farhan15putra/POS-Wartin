import { reactive } from 'vue'
import { products as productData, tables } from '../data/menu'

// Data produk & meja tinggal di src/data/menu.js (mock terpisah dari UI).
// Dibungkus reactive di lapisan ini agar mutasi (mis. toggle ketersediaan) memicu render ulang.
export { tables }
export const products = reactive(productData)
export const menuItems = products

export const store = {
  name: 'SOKIN WARTIN',
  badge: 'F&B POS',
  tagline: 'Point of Sale System',
  address: 'Jl. Melati No. 12, Bandung',
  phone: '0812-3456-7890',
  footerNote: 'Terima kasih atas kunjungan Anda',
}

export const currentUser = {
  name: 'Siti Rahma',
  role: 'Kasir & Admin',
  initials: 'SR',
  terminal: 'Terminal 01 (Meja Depan)',
}

export const categories = reactive([
  { id: 'semua', label: 'Semua Menu', icon: 'apps' },
  { id: 'makanan', label: 'Makanan', icon: 'dinner_dining' },
  { id: 'minuman', label: 'Minuman', icon: 'coffee' },
  { id: 'camilan', label: 'Camilan', icon: 'bakery_dining' },
])

export const discounts = [
  { id: 1, code: 'PROMO15', name: 'Promo Kopi Sore', type: 'percent', value: 15, scope: 'Kopi Susu Gula Aren', min: 0, active: true, period: '01 Nov - 30 Nov 2026', usage: 42 },
  { id: 2, code: 'HEMAT5K', name: 'Potongan Rp 5.000', type: 'amount', value: 5000, scope: 'Semua Menu', min: 30000, active: true, period: 'Sepanjang waktu', usage: 118 },
  { id: 3, code: 'PAKETDUO', name: 'Paket Duo Minuman', type: 'percent', value: 20, scope: 'Minuman', min: 0, active: false, period: '01 Okt - 31 Okt 2026', usage: 205 },
]

export const transactions = [
  { id: 'TRX-0042', time: '14:22', date: '05 Nov 2026', customer: 'Meja 04', cashier: 'Siti Rahma', method: 'Tunai', items: 4, total: 86000, status: 'Lunas' },
  { id: 'TRX-0041', time: '14:05', date: '05 Nov 2026', customer: 'Take away', cashier: 'Siti Rahma', method: 'QRIS', items: 2, total: 42000, status: 'Belum Lunas' },
  { id: 'TRX-0040', time: '13:48', date: '05 Nov 2026', customer: 'Meja 02', cashier: 'Budi Santoso', method: 'Transfer', items: 6, total: 152000, status: 'Lunas' },
  { id: 'TRX-0039', time: '13:30', date: '05 Nov 2026', customer: 'Meja 07', cashier: 'Siti Rahma', method: 'Tunai', items: 3, total: 64000, status: 'Dibatalkan' },
  { id: 'TRX-0038', time: '13:12', date: '05 Nov 2026', customer: 'Meja 01', cashier: 'Budi Santoso', method: 'QRIS', items: 5, total: 98000, status: 'Lunas' },
  { id: 'TRX-0037', time: '12:55', date: '05 Nov 2026', customer: 'Take away', cashier: 'Siti Rahma', method: 'Tunai', items: 1, total: 18000, status: 'Belum Lunas' },
  { id: 'TRX-0036', time: '12:40', date: '05 Nov 2026', customer: 'Meja 05', cashier: 'Budi Santoso', method: 'Tunai', items: 8, total: 214000, status: 'Lunas' },
  { id: 'TRX-0035', time: '12:20', date: '05 Nov 2026', customer: 'Meja 03', cashier: 'Siti Rahma', method: 'QRIS', items: 2, total: 46000, status: 'Lunas' },
]

export const ingredients = reactive([
  { id: 1, code: 'BHK-001', name: 'Biji Kopi Arabika Gayo', category: 'Kopi', unit: 'Kg', stock: 1.2, min: 3, status: 'menipis', updated: '08 Nov 2026', updatedTime: '09:30' },
  { id: 2, code: 'BHK-008', name: 'Susu Fresh Milk UHT', category: 'Dairy', unit: 'Liter', stock: 4, min: 12, status: 'menipis', updated: '08 Nov 2026', updatedTime: '10:15' },
  { id: 3, code: 'BHK-012', name: 'Gula Aren Cair Organik', category: 'Sirup & Pemanis', unit: 'Liter', stock: 0.8, min: 2.5, status: 'menipis', updated: '07 Nov 2026', updatedTime: '17:00' },
  { id: 4, code: 'BHK-019', name: 'Teh Melati Premium', category: 'Teh', unit: 'Gram', stock: 0, min: 500, status: 'habis', updated: '08 Nov 2026', updatedTime: '08:00' },
  { id: 5, code: 'BHK-024', name: 'Cup Plastik 16oz + Tutup', category: 'Kemasan', unit: 'Pcs', stock: 45, min: 100, status: 'menipis', updated: '03 Nov 2026', updatedTime: '11:20' },
  { id: 6, code: 'BHK-031', name: 'Beras Pandan Wangi', category: 'Bahan Makanan', unit: 'Kg', stock: 28, min: 10, status: 'aman', updated: '07 Nov 2026', updatedTime: '14:00' },
  { id: 7, code: 'BHK-015', name: 'Sirup Karamel 750ml', category: 'Sirup & Pemanis', unit: 'Botol', stock: 8, min: 3, status: 'aman', updated: '02 Nov 2026', updatedTime: '16:45' },
  { id: 8, code: 'BHK-026', name: 'Roti Tawar Gandum', category: 'Bakery', unit: 'Pack', stock: 15, min: 5, status: 'aman', updated: '08 Nov 2026', updatedTime: '07:00' },
])

export const opnameSession = {
  code: 'OPN-2026-11-05',
  officer: 'Budi Santoso',
  started: '05 Nov 2026, 08:00',
  rows: [
    { id: 1, code: 'BHK-001', name: 'Biji Kopi Arabika Gayo', unit: 'Kg', system: 1.2, physical: 1.2, note: '' },
    { id: 2, code: 'BHK-008', name: 'Susu Fresh Milk UHT', unit: 'Liter', system: 4, physical: 3.5, note: 'Sebagian bocor' },
    { id: 3, code: 'BHK-012', name: 'Gula Aren Cair Organik', unit: 'Liter', system: 0.8, physical: 0.8, note: '' },
    { id: 4, code: 'BHK-019', name: 'Teh Melati Premium', unit: 'Gram', system: 0, physical: 0, note: '' },
    { id: 5, code: 'BHK-024', name: 'Cup Plastik 16oz + Tutup', unit: 'Pcs', system: 45, physical: 43, note: '2 rusak' },
    { id: 6, code: 'BHK-031', name: 'Beras Pandan Wangi', unit: 'Kg', system: 28, physical: 28, note: '' },
  ],
}

export const incomingGoods = reactive([
  { id: 'GRN-0081', date: '05 Nov 2026', supplier: 'CV Kopi Nusantara', items: 3, total: 2450000, status: 'Diterima', invoice: 'INV-2026-1105' },
  { id: 'GRN-0080', date: '04 Nov 2026', supplier: 'PT Dairy Segar', items: 2, total: 1180000, status: 'Diterima', invoice: 'INV-2026-1104' },
  { id: 'GRN-0079', date: '03 Nov 2026', supplier: 'Toko Kemasan Jaya', items: 4, total: 860000, status: 'Menunggu', invoice: 'INV-2026-1103' },
  { id: 'GRN-0078', date: '02 Nov 2026', supplier: 'Bahan Pokok Makmur', items: 5, total: 3120000, status: 'Diterima', invoice: 'INV-2026-1102' },
  { id: 'GRN-0077', date: '01 Nov 2026', supplier: 'CV Kopi Nusantara', items: 2, total: 1740000, status: 'Diterima', invoice: 'INV-2026-1101' },
])

export const navSections = [
  {
    label: 'Administrasi & Kasir',
    items: [
      { id: 'kasir', label: 'Kasir', icon: 'point_of_sale' },
      { id: 'menu', label: 'Manajemen Menu', icon: 'restaurant_menu' },
      { id: 'kategori', label: 'Kategori Menu', icon: 'category' },
      { id: 'diskon', label: 'Diskon & Promo', icon: 'percent' },
      { id: 'stok', label: 'Stok & Bahan', icon: 'inventory_2' },
      { id: 'riwayat', label: 'Riwayat Transaksi', icon: 'receipt_long' },
    ],
  },
  {
    label: 'Staf Gudang',
    items: [
      { id: 'barang-masuk', label: 'Barang Masuk', icon: 'move_to_inbox' },
      { id: 'stok-opname', label: 'Stok Opname', icon: 'fact_check' },
    ],
  },
]
