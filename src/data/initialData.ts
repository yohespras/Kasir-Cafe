import { MenuItem, CafeTable, Order, StaffUser, CafeSettings, RolePermissionConfig, StaffRole } from '../types/cafe';

export const ROLE_PERMISSIONS: Record<StaffRole, RolePermissionConfig> = {
  kasir: {
    allowedTabs: ['pos', 'tables', 'selforder'],
    defaultTab: 'pos',
    roleTitle: 'Kasir & Front-of-House',
    dutyDescription: 'Melayani transaksi pesanan kasir, denah meja kafe, pembayaran tunai/QRIS, cetak struk, dan buka/tutup shift kasir.',
    canManageUsers: false,
    canManageSettings: false,
    canEditMenuPricing: false,
    canViewReports: false,
    canAccessGoogleSync: false,
    canManageShifts: true,
  },
  barista: {
    allowedTabs: ['kds', 'menu'],
    defaultTab: 'kds',
    roleTitle: 'Barista & Minuman',
    dutyDescription: 'Menerima dan memproses antrean pesanan minuman/kopi di KDS, serta memantau dan mengubah status ketersediaan minuman (habis/tersedia).',
    canManageUsers: false,
    canManageSettings: false,
    canEditMenuPricing: false,
    canViewReports: false,
    canAccessGoogleSync: false,
    canManageShifts: false,
  },
  kitchen: {
    allowedTabs: ['kds', 'menu'],
    defaultTab: 'kds',
    roleTitle: 'Head Cook & Dapur',
    dutyDescription: 'Menerima dan memasak pesanan makanan/snack di KDS, serta memantau dan mengubah status ketersediaan bahan dapur & makanan.',
    canManageUsers: false,
    canManageSettings: false,
    canEditMenuPricing: false,
    canViewReports: false,
    canAccessGoogleSync: false,
    canManageShifts: false,
  },
  manager: {
    allowedTabs: ['pos', 'tables', 'kds', 'menu', 'reports', 'users', 'settings', 'google', 'selforder'],
    defaultTab: 'pos',
    roleTitle: 'Manajer & Owner',
    dutyDescription: 'Akses penuh ke seluruh operasional kafe: POS, meja, KDS, katalog harga menu, laporan omset/laba, kelola pengguna staf, pengaturan sistem kafe, dan sinkronisasi Google.',
    canManageUsers: true,
    canManageSettings: true,
    canEditMenuPricing: true,
    canViewReports: true,
    canAccessGoogleSync: true,
    canManageShifts: true,
  }
};

export const DEFAULT_CAFE_SETTINGS: CafeSettings = {
  cafeName: 'Kopi Senja Cafe & Roastery',
  tagline: 'Specialty Coffee, Artisan Bakery & Warm Conversations',
  address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
  phone: '021-789-2041 / WA 0812-3456-7890',
  email: 'halo@kopisenja.id',
  openingHours: 'Setiap Hari: 08:00 - 23:00 WIB',
  taxEnabled: true,
  taxRate: 10,
  serviceChargeEnabled: false,
  serviceChargeRate: 5,
  receiptHeader: 'KOPI SENJA CAFE & ROASTERY',
  receiptCafeName: 'KOPI SENJA SPECIALTY',
  receiptLogoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
  receiptShowLogo: true,
  receiptLogoType: 'icon',
  receiptWifiUsername: 'KopiSenja_Guest',
  receiptWifiPassword: 'senjaindah',
  receiptCashierPrefix: 'Kasir',
  receiptFooter: 'TERIMA KASIH ATAS KUNJUNGAN ANDA',
  wifiSsid: 'KopiSenja_Guest',
  wifiPassword: 'senjaindah',
  paperWidth: '58mm',
  autoPrintReceipt: true,
  qrisMerchantName: 'KOPI SENJA JAKARTA',
  qrisNmid: 'ID1020039482910',
  bankAccountInfo: 'BCA 800-123-4567 a.n PT Kopi Senja Indonesia',
  enabledPayments: {
    cash: true,
    qris: true,
    edc: true,
    transfer: true
  }
};

export const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Sarah Amanda',
    role: 'kasir',
    roleLabel: 'Kasir Utama',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'staff-2',
    name: 'Budi Santoso',
    role: 'barista',
    roleLabel: 'Head Barista',
    pin: '2345',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'staff-3',
    name: 'Chef Rian',
    role: 'kitchen',
    roleLabel: 'Head Kitchen & Dapur',
    pin: '3456',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'staff-4',
    name: 'Hendra Wijaya',
    role: 'manager',
    roleLabel: 'Manajer & Owner',
    pin: '9999',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Kopi Susu Gula Aren Senja',
    category: 'signature',
    price: 24000,
    costPrice: 9500,
    description: 'Signature espresso blend dengan susu segar creamy dan sirup aren murni organik Cianjur.',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 48,
    soldCount: 142,
    badge: 'Best Seller',
    options: {
      iceOptions: ['Normal Ice', 'Less Ice', 'No Ice', 'Hot'],
      sugarOptions: ['Normal 100%', 'Less 75%', 'Half 50%', 'No Sugar'],
      additions: [
        { name: 'Extra Shot Espresso', price: 6000 },
        { name: 'Ganti Oat Milk', price: 8000 },
        { name: 'Grass Jelly Topping', price: 4000 }
      ]
    }
  },
  {
    id: 'menu-2',
    name: 'Spanish Latte Caramelized',
    category: 'signature',
    price: 28000,
    costPrice: 11000,
    description: 'Double ristretto dipadukan dengan condensed milk lembut dan taburan sea salt caramel crunchy.',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 35,
    soldCount: 98,
    badge: 'Favorit',
    options: {
      iceOptions: ['Normal Ice', 'Less Ice', 'Hot'],
      sugarOptions: ['Normal 100%', 'Less 75%', 'Half 50%'],
      additions: [
        { name: 'Extra Shot', price: 6000 },
        { name: 'Vanilla Ice Cream Scoop', price: 8000 }
      ]
    }
  },
  {
    id: 'menu-3',
    name: 'Iced Americano Classic',
    category: 'coffee',
    price: 20000,
    costPrice: 5000,
    description: 'Double shot espresso blend Arabica Aceh Gayo & Flores Bajawa dengan air mineral dingin yang segar.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 60,
    soldCount: 86,
    options: {
      iceOptions: ['Normal Ice', 'Less Ice', 'Hot'],
      sugarOptions: ['Tanpa Gula', 'Simple Syrup Pisah'],
      additions: [
        { name: 'Extra Shot', price: 6000 }
      ]
    }
  },
  {
    id: 'menu-4',
    name: 'Caffe Latte Double Shot',
    category: 'coffee',
    price: 26000,
    costPrice: 10000,
    description: 'Espresso kaya rasa berpadu dengan steamed fresh milk bertekstur mikro-foam halus.',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 40,
    soldCount: 75,
    options: {
      iceOptions: ['Hot', 'Normal Ice', 'Less Ice'],
      sugarOptions: ['Tanpa Gula', 'Normal 100%', 'Less 50%'],
      additions: [
        { name: 'Oat Milk Sub', price: 8000 },
        { name: 'Caramel Syrup', price: 5000 }
      ]
    }
  },
  {
    id: 'menu-5',
    name: 'V60 Pour Over Single Origin',
    category: 'manual_brew',
    price: 32000,
    costPrice: 12000,
    description: 'Manual brew pour over biji kopi pilihan (Gayo Wine / Kerinci Natural). Tasting notes: fruity, jasmine, floral.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 25,
    soldCount: 54,
    badge: 'Artisan',
    options: {
      iceOptions: ['Hot', 'Japanese Iced (+Ice)'],
      additions: [
        { name: 'Biji Beans Terpilih Reserva', price: 8000 }
      ]
    }
  },
  {
    id: 'menu-6',
    name: 'Matcha Uji Ceremonial Latte',
    category: 'non_coffee',
    price: 29000,
    costPrice: 12500,
    description: 'Bubuk green tea matcha asli Kyoto Uji dengan susu segar creamy dan rasa umami manis lembut.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 30,
    soldCount: 68,
    badge: 'Rekomendasi',
    options: {
      iceOptions: ['Normal Ice', 'Less Ice', 'Hot'],
      sugarOptions: ['Normal 100%', 'Less 75%', 'Half 50%'],
      additions: [
        { name: 'Oat Milk Sub', price: 8000 },
        { name: 'Espresso Dirty Shot', price: 7000 }
      ]
    }
  },
  {
    id: 'menu-7',
    name: 'Artisan Earl Grey Milk Tea',
    category: 'non_coffee',
    price: 25000,
    costPrice: 8500,
    description: 'Seduhan daun teh hitam bergamot beraroma floral dengan susu lembut dan gula aren.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 32,
    soldCount: 41,
    options: {
      iceOptions: ['Normal Ice', 'Less Ice', 'Hot'],
      sugarOptions: ['Normal 100%', 'Less 75%', 'Half 50%']
    }
  },
  {
    id: 'menu-8',
    name: 'Nasi Goreng Kampung Spesial Senja',
    category: 'food',
    price: 36000,
    costPrice: 14000,
    description: 'Nasi goreng bumbu rempah tradisional dengan ayam suwir, telur mata sapi, sate ayam, dan kerupuk udang.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 20,
    soldCount: 88,
    badge: 'Favorit',
    options: {
      sugarOptions: ['Pedas Sedang', 'Pedas Banget', 'Tidak Pedas'],
      additions: [
        { name: 'Extra Telur Ceplok', price: 5000 },
        { name: 'Extra Sate Ayam (2 pcs)', price: 10000 }
      ]
    }
  },
  {
    id: 'menu-9',
    name: 'Beef Teriyaki Rice Bowl',
    category: 'food',
    price: 42000,
    costPrice: 18000,
    description: 'Irisan daging sapi US shortplate empuk dengan saus teriyaki gurih manis, biji wijen, dan scrambled egg.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 18,
    soldCount: 62,
    badge: 'Chef Pick',
    options: {
      additions: [
        { name: 'Extra Daging Sapi', price: 15000 },
        { name: 'Melted Mozzarella', price: 8000 }
      ]
    }
  },
  {
    id: 'menu-10',
    name: 'Spaghetti Aglio Olio Smoked Beef',
    category: 'food',
    price: 38000,
    costPrice: 15000,
    description: 'Spaghetti al dente ditumis minyak zaitun extra virgin, bawang putih, chilli flakes, dan irisan daging asap gurih.',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 15,
    soldCount: 49,
    options: {
      sugarOptions: ['Pedas Normal', 'Extra Pedas', 'Tidak Pedas'],
      additions: [
        { name: 'Extra Smoked Beef', price: 8000 },
        { name: 'Parmesan Cheese Extra', price: 6000 }
      ]
    }
  },
  {
    id: 'menu-11',
    name: 'Truffle Fries with Parmesan',
    category: 'snack',
    price: 28000,
    costPrice: 9000,
    description: 'Kentang goreng renyah dengan aroma minyak white truffle asli, parutan keju parmesan, dan saus garlic mayo.',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 40,
    soldCount: 110,
    badge: 'Best Snack',
    options: {
      additions: [
        { name: 'Extra Garlic Mayo Dip', price: 4000 },
        { name: 'Cheese Sauce Dip', price: 5000 }
      ]
    }
  },
  {
    id: 'menu-12',
    name: 'Butter Almond Croissant',
    category: 'dessert',
    price: 27000,
    costPrice: 10000,
    description: 'Pastry khas Prancis berlapis mentega impor New Zealand dengan isian krim almond dan taburan almond panggang.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 12,
    soldCount: 52,
    options: {
      sugarOptions: ['Dihangatkan (Warm)', 'Suhu Ruang (Normal)']
    }
  },
  {
    id: 'menu-13',
    name: 'Choco Lava Cake & Vanilla Gelato',
    category: 'dessert',
    price: 33000,
    costPrice: 12000,
    description: 'Kue cokelat Belgia hangat dengan lelehan cokelat lumer di tengah, disajikan dengan satu scoop vanilla gelato.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    stock: 8,
    soldCount: 44,
    badge: 'Sweet Tooth'
  }
];

export const INITIAL_TABLES: CafeTable[] = [
  { id: 'tbl-1', number: '01', name: 'Meja 01 (Indoor Window)', capacity: 2, zone: 'indoor', status: 'occupied', currentOrderId: 'KS-102', guestCount: 2, occupiedSince: '12:15' },
  { id: 'tbl-2', number: '02', name: 'Meja 02 (Indoor Window)', capacity: 2, zone: 'indoor', status: 'available' },
  { id: 'tbl-3', number: '03', name: 'Meja 03 (Indoor Center)', capacity: 4, zone: 'indoor', status: 'available' },
  { id: 'tbl-4', number: '04', name: 'Meja 04 (Indoor Center)', capacity: 4, zone: 'indoor', status: 'occupied', currentOrderId: 'KS-104', guestCount: 3, occupiedSince: '12:40' },
  { id: 'tbl-5', number: '05', name: 'Meja 05 (Sofa Corner)', capacity: 6, zone: 'indoor', status: 'reserved' },
  { id: 'tbl-6', number: '06', name: 'Meja 06 (Indoor Bar)', capacity: 2, zone: 'bar', status: 'available' },
  { id: 'tbl-7', number: '07', name: 'Meja 07 (Indoor Bar)', capacity: 2, zone: 'bar', status: 'cleaning' },
  { id: 'tbl-8', number: '08', name: 'Meja 08 (Outdoor Garden)', capacity: 4, zone: 'outdoor', status: 'available' },
  { id: 'tbl-9', number: '09', name: 'Meja 09 (Outdoor Garden)', capacity: 4, zone: 'outdoor', status: 'available' },
  { id: 'tbl-10', number: '10', name: 'Meja 10 (Outdoor Smoking)', capacity: 6, zone: 'outdoor', status: 'available' },
  { id: 'tbl-11', number: 'VIP-1', name: 'Ruang VIP Senja 1', capacity: 10, zone: 'vip', status: 'available' },
  { id: 'tbl-12', number: 'VIP-2', name: 'Ruang VIP Senja 2', capacity: 12, zone: 'vip', status: 'reserved' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'KS-101',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    type: 'dine_in',
    tableNumber: '02',
    customerName: 'Dimas Aditya',
    items: [
      {
        id: 'cart-1',
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 2,
        selectedOptions: { temperature: 'Ice', sugar: 'Less (75%)' },
        unitPrice: 24000,
        totalPrice: 48000
      },
      {
        id: 'cart-2',
        menuItem: INITIAL_MENU_ITEMS[10],
        quantity: 1,
        selectedOptions: {},
        unitPrice: 28000,
        totalPrice: 28000
      }
    ],
    subtotal: 76000,
    discount: 0,
    tax: 7600,
    serviceCharge: 0,
    totalAmount: 83600,
    paymentMethod: 'qris',
    amountPaid: 83600,
    change: 0,
    status: 'completed',
    cashierName: 'Sarah Amanda',
    syncedToSheets: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord-102',
    orderNumber: 'KS-102',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    type: 'dine_in',
    tableNumber: '01',
    customerName: 'Maya Putri',
    items: [
      {
        id: 'cart-3',
        menuItem: INITIAL_MENU_ITEMS[1],
        quantity: 1,
        selectedOptions: { temperature: 'Ice', sugar: 'Normal (100%)' },
        unitPrice: 28000,
        totalPrice: 28000
      },
      {
        id: 'cart-4',
        menuItem: INITIAL_MENU_ITEMS[7],
        quantity: 1,
        selectedOptions: { sugar: 'Pedas Sedang' },
        unitPrice: 36000,
        totalPrice: 36000
      }
    ],
    subtotal: 64000,
    discount: 0,
    tax: 6400,
    serviceCharge: 0,
    totalAmount: 70400,
    paymentMethod: 'cash',
    amountPaid: 100000,
    change: 29600,
    status: 'ready',
    cashierName: 'Sarah Amanda',
    syncedToSheets: false,
    kitchenPreparedAt: new Date(Date.now() - 3600000 * 0.4).toISOString()
  },
  {
    id: 'ord-103',
    orderNumber: 'KS-103',
    timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    type: 'takeaway',
    customerName: 'Kevin Wijaya',
    items: [
      {
        id: 'cart-5',
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 3,
        selectedOptions: { temperature: 'Ice', sugar: 'Normal (100%)' },
        unitPrice: 24000,
        totalPrice: 72000
      },
      {
        id: 'cart-6',
        menuItem: INITIAL_MENU_ITEMS[11],
        quantity: 2,
        selectedOptions: { sugar: 'Dihangatkan (Warm)' },
        unitPrice: 27000,
        totalPrice: 54000
      }
    ],
    subtotal: 126000,
    discount: 12600,
    discountCode: 'SENJA10',
    tax: 11340,
    serviceCharge: 0,
    totalAmount: 124740,
    paymentMethod: 'qris',
    amountPaid: 124740,
    change: 0,
    status: 'preparing',
    cashierName: 'Budi Santoso',
    syncedToSheets: false
  },
  {
    id: 'ord-104',
    orderNumber: 'KS-104',
    timestamp: new Date(Date.now() - 3600000 * 0.15).toISOString(),
    type: 'dine_in',
    tableNumber: '04',
    customerName: 'Rina & Teman',
    items: [
      {
        id: 'cart-7',
        menuItem: INITIAL_MENU_ITEMS[4],
        quantity: 1,
        selectedOptions: { temperature: 'Hot' },
        unitPrice: 32000,
        totalPrice: 32000
      },
      {
        id: 'cart-8',
        menuItem: INITIAL_MENU_ITEMS[8],
        quantity: 2,
        selectedOptions: {},
        unitPrice: 42000,
        totalPrice: 84000
      }
    ],
    subtotal: 116000,
    discount: 0,
    tax: 11600,
    serviceCharge: 0,
    totalAmount: 127600,
    paymentMethod: 'debit',
    amountPaid: 127600,
    change: 0,
    status: 'pending',
    cashierName: 'Sarah Amanda',
    syncedToSheets: false
  }
];
