export type CategoryType = 
  | 'all'
  | 'coffee'
  | 'signature'
  | 'manual_brew'
  | 'non_coffee'
  | 'food'
  | 'snack'
  | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  costPrice: number; // HPP (Harga Pokok Penjualan)
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
  soldCount: number;
  badge?: string; // e.g., 'Best Seller', 'Signature', 'Favorit'
  options?: {
    iceOptions?: string[]; // e.g. ['Normal Ice', 'Less Ice', 'No Ice', 'Hot']
    sugarOptions?: string[]; // e.g. ['Normal 100%', 'Less 75%', 'Half 50%', 'No Sugar']
    additions?: { name: string; price: number }[];
  };
}

export interface SelectedOptions {
  temperature?: string;
  sugar?: string;
  extras?: { name: string; price: number }[];
  notes?: string;
}

export interface CartItem {
  id: string; // unique item instance id in cart
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOptions;
  unitPrice: number; // base price + extras
  totalPrice: number;
}

export type OrderType = 'dine_in' | 'takeaway';

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'transfer';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. KS-2401
  timestamp: string; // ISO string
  type: OrderType;
  tableNumber?: string;
  customerName: string;
  customerNotes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number; // 10%
  serviceCharge: number; // optional (e.g. 5%)
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: OrderStatus;
  cashierName: string;
  syncedToSheets?: boolean;
  driveFileId?: string;
  kitchenPreparedAt?: string;
  completedAt?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface CafeTable {
  id: string;
  number: string;
  name: string;
  capacity: number;
  zone: 'indoor' | 'outdoor' | 'bar' | 'vip';
  status: TableStatus;
  currentOrderId?: string;
  guestCount?: number;
  occupiedSince?: string;
}

export interface CashierShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  cashDifference?: number;
  totalTransactions: number;
  totalRevenue: number;
  notes?: string;
  isOpen: boolean;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  webViewLink?: string;
  type: 'backup_json' | 'receipt_html';
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

export type ThemeMode = 'dark' | 'light';

export type ActiveTab = 
  | 'pos' 
  | 'tables' 
  | 'kds' 
  | 'menu' 
  | 'reports' 
  | 'users' 
  | 'settings' 
  | 'google' 
  | 'selforder';

export type StaffRole = 'kasir' | 'barista' | 'kitchen' | 'manager';

export interface RolePermissionConfig {
  allowedTabs: ActiveTab[];
  defaultTab: ActiveTab;
  roleTitle: string;
  dutyDescription: string;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canEditMenuPricing: boolean;
  canViewReports: boolean;
  canAccessGoogleSync: boolean;
  canManageShifts: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  roleLabel: string;
  pin: string;
  avatar: string;
  phone?: string;
  isActive?: boolean;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  taxEnabled: boolean;
  taxRate: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  // Receipt customization fields (Nama, Logo, Wifi Password & Username, Kasir)
  receiptHeader: string;
  receiptCafeName: string;
  receiptLogoUrl?: string;
  receiptShowLogo: boolean;
  receiptLogoType: 'icon' | 'image' | 'monogram';
  receiptWifiUsername: string;
  receiptWifiPassword: string;
  receiptCashierPrefix: string;
  receiptFooter: string;
  wifiSsid: string;
  wifiPassword: string;
  paperWidth: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  qrisMerchantName: string;
  qrisNmid: string;
  bankAccountInfo: string;
  enabledPayments: {
    cash: boolean;
    qris: boolean;
    edc: boolean;
    transfer: boolean;
  };
}

