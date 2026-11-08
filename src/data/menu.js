// Mock data terpisah dari UI. Ganti isi ini dengan panggilan API tanpa mengubah komponen.
// Group: { id, name, type: 'single'|'multi', required, options[] }
// Option: { id, name, extraPrice, isDefault }
import nasiGorengImage from '../assets/menu-nasigorengspesial.webp'

export const products = [
  {
    id: 1, sku: 'MKN-001', name: 'Nasi Goreng Spesial', category: 'makanan', price: 28000, stock: 12,
    image: nasiGorengImage,
    groups: [
      { id: 'pedas', name: 'Level Pedas', type: 'single', required: true, options: [
        { id: 'tidak', name: 'Tidak pedas', extraPrice: 0, isDefault: true },
        { id: 'sedang', name: 'Sedang', extraPrice: 0 },
        { id: 'pedas', name: 'Pedas', extraPrice: 0 },
      ] },
      { id: 'telur', name: 'Telur', type: 'single', required: true, options: [
        { id: 'ceplok', name: 'Ceplok', extraPrice: 0, isDefault: true },
        { id: 'dadar', name: 'Dadar', extraPrice: 0 },
        { id: 'tanpa', name: 'Tanpa telur', extraPrice: 0 },
      ] },
      { id: 'addon', name: 'Add-on', type: 'multi', required: false, options: [
        { id: 'telur_extra', name: 'Telur extra', extraPrice: 4000 },
        { id: 'sosis', name: 'Sosis', extraPrice: 5000 },
        { id: 'kerupuk', name: 'Kerupuk', extraPrice: 2000 },
      ] },
    ],
  },
  {
    id: 2, sku: 'MKN-002', name: 'Bakso Campur Urat', category: 'makanan', price: 26000, stock: 10,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'pedas', name: 'Level Pedas', type: 'single', required: true, options: [
        { id: 'tidak', name: 'Tidak pedas', extraPrice: 0, isDefault: true },
        { id: 'sedang', name: 'Sedang', extraPrice: 0 },
        { id: 'pedas', name: 'Pedas', extraPrice: 0 },
      ] },
      { id: 'isian', name: 'Isian Mie', type: 'single', required: true, options: [
        { id: 'campur', name: 'Campur', extraPrice: 0, isDefault: true },
        { id: 'bihun', name: 'Bihun', extraPrice: 0 },
        { id: 'mie_kuning', name: 'Mie kuning', extraPrice: 0 },
      ] },
      { id: 'addon', name: 'Add-on', type: 'multi', required: false, options: [
        { id: 'bakso_extra', name: 'Bakso extra', extraPrice: 6000 },
        { id: 'pangsit', name: 'Pangsit', extraPrice: 4000 },
      ] },
    ],
  },
  {
    id: 3, sku: 'MKN-003', name: 'Mie Goreng Telur', category: 'makanan', price: 20000, stock: 14,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'pedas', name: 'Level Pedas', type: 'single', required: true, options: [
        { id: 'tidak', name: 'Tidak pedas', extraPrice: 0, isDefault: true },
        { id: 'sedang', name: 'Sedang', extraPrice: 0 },
        { id: 'pedas', name: 'Pedas', extraPrice: 0 },
      ] },
      { id: 'addon', name: 'Add-on', type: 'multi', required: false, options: [
        { id: 'telur_extra', name: 'Telur extra', extraPrice: 4000 },
        { id: 'sosis', name: 'Sosis', extraPrice: 5000 },
      ] },
    ],
  },
  {
    id: 4, sku: 'CML-001', name: 'Roti Bakar Coklat Keju', category: 'camilan', price: 22000, stock: 0,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'addon', name: 'Add-on', type: 'multi', required: false, options: [
        { id: 'keju_extra', name: 'Keju extra', extraPrice: 4000 },
        { id: 'skm', name: 'Susu kental manis', extraPrice: 2000 },
        { id: 'meses', name: 'Meses', extraPrice: 2000 },
        { id: 'es_krim', name: 'Es krim', extraPrice: 6000 },
      ] },
    ],
  },
  {
    id: 5, sku: 'CML-002', name: 'Keripik Kentang', category: 'camilan', price: 10000, stock: 30,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'rasa', name: 'Rasa', type: 'single', required: true, options: [
        { id: 'original', name: 'Original', extraPrice: 0, isDefault: true },
        { id: 'bbq', name: 'BBQ', extraPrice: 0 },
        { id: 'balado', name: 'Balado', extraPrice: 0 },
      ] },
    ],
  },
  {
    id: 6, sku: 'KOP-001', name: 'Kopi Susu Gula Aren', category: 'minuman', price: 18000, promoPercent: 15, stock: 20,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'suhu', name: 'Suhu', type: 'single', required: true, options: [
        { id: 'ice', name: 'Ice', extraPrice: 0, isDefault: true },
        { id: 'hot', name: 'Hot', extraPrice: 0 },
      ] },
      { id: 'gula', name: 'Gula', type: 'single', required: true, options: [
        { id: 'normal', name: 'Normal', extraPrice: 0, isDefault: true },
        { id: 'less_sugar', name: 'Less sugar', extraPrice: 0 },
        { id: 'no_sugar', name: 'No sugar', extraPrice: 0 },
      ] },
      { id: 'addon', name: 'Add-on', type: 'multi', required: false, options: [
        { id: 'shot', name: 'Shot espresso', extraPrice: 5000 },
      ] },
    ],
  },
  {
    id: 7, sku: 'MNM-001', name: 'Teh Panas', category: 'minuman', price: 6000, stock: 25,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'rasa', name: 'Rasa', type: 'single', required: true, options: [
        { id: 'manis', name: 'Manis', extraPrice: 0, isDefault: true },
        { id: 'tawar', name: 'Tawar', extraPrice: 0 },
        { id: 'less_sugar', name: 'Less sugar', extraPrice: 0 },
      ] },
    ],
  },
  {
    id: 8, sku: 'MNM-002', name: 'Es Teh', category: 'minuman', price: 8000, stock: 25,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'rasa', name: 'Rasa', type: 'single', required: true, options: [
        { id: 'manis', name: 'Manis', extraPrice: 0, isDefault: true },
        { id: 'tawar', name: 'Tawar', extraPrice: 0 },
        { id: 'less_sugar', name: 'Less sugar', extraPrice: 0 },
      ] },
      { id: 'es', name: 'Es', type: 'single', required: true, options: [
        { id: 'normal', name: 'Normal', extraPrice: 0, isDefault: true },
        { id: 'less_ice', name: 'Less ice', extraPrice: 0 },
        { id: 'tanpa_es', name: 'Tanpa es', extraPrice: 0 },
      ] },
      { id: 'ukuran', name: 'Ukuran', type: 'single', required: true, options: [
        { id: 'regular', name: 'Regular', extraPrice: 0, isDefault: true },
        { id: 'jumbo', name: 'Jumbo', extraPrice: 4000 },
      ] },
    ],
  },
  {
    id: 9, sku: 'MNM-003', name: 'Matcha Latte', category: 'minuman', price: 24000, stock: 15,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
    groups: [
      { id: 'ukuran', name: 'Ukuran', type: 'single', required: true, options: [
        { id: 'regular', name: 'Regular', extraPrice: 0, isDefault: true },
        { id: 'large', name: 'Large', extraPrice: 3000 },
      ] },
      { id: 'suhu', name: 'Suhu', type: 'single', required: true, options: [
        { id: 'ice', name: 'Ice', extraPrice: 0, isDefault: true },
        { id: 'hot', name: 'Hot', extraPrice: 0 },
      ] },
      { id: 'gula', name: 'Gula', type: 'single', required: true, options: [
        { id: 'normal', name: 'Normal', extraPrice: 0, isDefault: true },
        { id: 'less_sugar', name: 'Less sugar', extraPrice: 0 },
        { id: 'no_sugar', name: 'No sugar', extraPrice: 0 },
      ] },
      { id: 'topping', name: 'Topping', type: 'multi', required: false, options: [
        { id: 'boba', name: 'Boba', extraPrice: 5000 },
        { id: 'pudding', name: 'Pudding', extraPrice: 4000 },
      ] },
    ],
  },
  {
    id: 10, sku: 'MNM-004', name: 'Air Mineral', category: 'minuman', price: 5000, stock: 50,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
    groups: [],
  },
]

export const tables = [
  { id: '01', seats: 4, status: 'terisi' },
  { id: '02', seats: 2, status: 'kosong' },
  { id: '03', seats: 4, status: 'kosong' },
  { id: '04', seats: 6, status: 'terisi' },
  { id: '05', seats: 4, status: 'kosong' },
  { id: '06', seats: 2, status: 'kosong' },
  { id: '07', seats: 4, status: 'terisi' },
  { id: '08', seats: 8, status: 'kosong' },
  { id: '09', seats: 4, status: 'kosong' },
  { id: '10', seats: 6, status: 'kosong' },
]

// Field turunan untuk kompatibilitas tampilan admin (menuItems lama).
products.forEach((p) => {
  p.promo = p.promoPercent || 0
  p.available = p.stock > 0
})
