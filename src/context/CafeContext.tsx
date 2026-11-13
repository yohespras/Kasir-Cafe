import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  MenuItem, 
  CartItem, 
  Order, 
  CafeTable, 
  CashierShift, 
  DriveBackupFile, 
  GoogleSheetsConfig, 
  PaymentMethod,
  OrderType,
  OrderStatus,
  SelectedOptions,
  ThemeMode,
  StaffUser,
  ActiveTab,
  CafeSettings,
  StaffRole,
  RolePermissionConfig
} from '../types/cafe';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_ORDERS, 
  DEFAULT_STAFF_USERS,
  DEFAULT_CAFE_SETTINGS,
  ROLE_PERMISSIONS
} from '../data/initialData';
import { initAuth, googleSignIn, logout as fbLogout, getAccessToken } from '../services/firebaseAuth';
import { 
  createCafeSpreadsheet, 
  appendOrderToSpreadsheet, 
  syncBulkOrdersToSpreadsheet,
  syncMenuStockToSpreadsheet,
  syncDailySummaryToSpreadsheet
} from '../services/googleSheets';
import { 
  listCafeDriveFiles, 
  uploadBackupToDrive, 
  uploadReceiptToDrive, 
  deleteDriveFile 
} from '../services/googleDrive';
import { soundFx } from '../services/soundEffects';

export { type ActiveTab };

export interface DestructiveConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface CafeContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Theme (Dark / Light Mode)
  theme: ThemeMode;
  toggleTheme: () => void;

  // Settings
  cafeSettings: CafeSettings;
  updateCafeSettings: (settings: Partial<CafeSettings>) => void;

  // Staff Login & Authentication
  staffUsers: StaffUser[];
  activeStaff: StaffUser | null;
  isStaffLoggedIn: boolean;
  loginStaff: (pin: string) => boolean;
  loginStaffById: (id: string) => void;
  logoutStaff: () => void;
  addStaffUser: (user: Omit<StaffUser, 'id'>) => void;
  updateStaffUser: (user: StaffUser) => void;
  deleteStaffUser: (id: string) => { success: boolean; message: string };
  resetStaffPin: (id: string, newPin: string) => boolean;

  // Role Permissions
  rolePermissions: Record<StaffRole, RolePermissionConfig>;
  hasTabPermission: (tab: ActiveTab) => boolean;

  // Sidebar Controls
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'soldCount'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  updateItemStock: (id: string, newStock: number) => void;

  // Cart & POS
  cart: CartItem[];
  addToCart: (item: MenuItem, options?: SelectedOptions) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedTableNumber: string;
  setSelectedTableNumber: (tbl: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountAmount: number;
  taxAmount: number;
  serviceChargeAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };

  // Orders
  orders: Order[];
  createOrder: (paymentMethod: PaymentMethod, amountPaid: number) => Order;
  createDirectOrder: (orderData: {
    tableNumber?: string;
    type?: OrderType;
    customerName?: string;
    customerNotes?: string;
    items: CartItem[];
    subtotal: number;
    discount?: number;
    discountCode?: string;
    tax: number;
    serviceCharge: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
    cashierName?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Tables
  tables: CafeTable[];
  updateTableStatus: (tableId: string, status: CafeTable['status']) => void;
  transferTable: (fromTableNumber: string, toTableNumber: string) => void;
  clearTableBill: (tableNumber: string) => void;
  settleTableOrder: (tableNumber: string, paymentMethod: PaymentMethod, amountPaid?: number) => Order | null;
  targetSelfOrderTable: string;
  setTargetSelfOrderTable: (tbl: string) => void;
  openSelfOrderForTable: (tableNumber: string) => void;

  // Shift & Cashier
  activeCashier: string;
  setActiveCashier: (name: string) => void;
  currentShift: CashierShift;
  startNewShift: (cashierName: string, openingCash: number) => void;
  closeCurrentShift: (actualClosingCash: number, notes?: string) => void;

  // Google Workspace
  googleUser: User | null;
  isGoogleAuthenticated: boolean;
  isAuthLoading: boolean;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  sheetsConfig: GoogleSheetsConfig;
  updateSheetsConfig: (cfg: Partial<GoogleSheetsConfig>) => void;
  connectGoogleSheet: () => Promise<void>;
  syncAllToGoogleSheets: () => Promise<{ success: boolean; count: number; message: string }>;
  
  // Google Drive
  driveFiles: DriveBackupFile[];
  isLoadingDrive: boolean;
  refreshDriveFiles: () => Promise<void>;
  createDriveBackup: () => Promise<{ success: boolean; message: string; link?: string }>;
  deleteDriveItem: (fileId: string, fileName: string) => Promise<void>;
  saveReceiptToGoogleDrive: (order: Order, htmlContent: string) => Promise<string>;

  // Receipt Modal
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;

  // Confirmation Modal
  confirmModal: DestructiveConfirmConfig;
  showConfirmModal: (config: Omit<DestructiveConfirmConfig, 'isOpen'>) => void;
  closeConfirmModal: () => void;

  // System & Reset
  resetToDemoData: () => void;
}

const CafeContext = createContext<CafeContextType | null>(null);

const STORAGE_KEYS = {
  MENU: 'kopi_senja_menu_v1',
  ORDERS: 'kopi_senja_orders_v1',
  TABLES: 'kopi_senja_tables_v1',
  SHIFT: 'kopi_senja_shift_v1',
  SHEETS_CFG: 'kopi_senja_sheets_cfg_v1',
  CASHIER: 'kopi_senja_cashier_v1',
  THEME: 'kopi_senja_theme_v1',
  STAFF: 'kopi_senja_staff_v1',
  STAFF_USERS: 'kopi_senja_staff_users_v1',
  SETTINGS: 'kopi_senja_settings_v1',
  SIDEBAR: 'kopi_senja_sidebar_v1'
};

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [targetSelfOrderTable, setTargetSelfOrderTable] = useState<string>('01');

  // Load initial or persisted state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [tables, setTables] = useState<CafeTable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [activeCashier, setActiveCashierState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CASHIER) || 'Sarah Amanda';
    } catch {
      return 'Sarah Amanda';
    }
  });

  const [currentShift, setCurrentShift] = useState<CashierShift>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFT);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      id: 'shift-1',
      cashierName: 'Sarah Amanda',
      startTime: new Date().toISOString(),
      openingCash: 300000,
      totalTransactions: 3,
      totalRevenue: 278740,
      isOpen: true
    };
  });

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHEETS_CFG);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetTitle: 'Kopi Senja POS - Pembukuan & Penjualan',
      lastSyncedAt: null,
      autoSync: true
    };
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('01');
  const [customerName, setCustomerName] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Modals & UI
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState<DestructiveConfirmConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Google Workspace auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch {}
  }, [theme]);

  // Cafe Settings State
  const [cafeSettings, setCafeSettings] = useState<CafeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_CAFE_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CAFE_SETTINGS;
  });

  const updateCafeSettings = (newSettings: Partial<CafeSettings>) => {
    setCafeSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Staff Authentication & User Management State
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(staffUsers));
    } catch {}
  }, [staffUsers]);

  const [activeStaff, setActiveStaff] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF_USERS[0];
  });
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(true);

  // Role permissions check
  const hasTabPermission = (tab: ActiveTab): boolean => {
    if (!activeStaff) return false;
    const permissions = ROLE_PERMISSIONS[activeStaff.role];
    return permissions?.allowedTabs.includes(tab) ?? false;
  };

  // Whenever activeStaff changes, ensure they are on an allowed tab
  useEffect(() => {
    if (activeStaff) {
      const permissions = ROLE_PERMISSIONS[activeStaff.role];
      if (permissions && !permissions.allowedTabs.includes(activeTab)) {
        setActiveTab(permissions.defaultTab);
      }
    }
  }, [activeStaff]);

  const loginStaff = (pin: string): boolean => {
    const user = staffUsers.find(u => u.pin === pin.trim());
    if (user) {
      setActiveStaff(user);
      setActiveCashier(user.name);
      setIsStaffLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(user));
      } catch {}
      return true;
    }
    return false;
  };

  const loginStaffById = (id: string) => {
    const user = staffUsers.find(u => u.id === id);
    if (user) {
      setActiveStaff(user);
      setActiveCashier(user.name);
      setIsStaffLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(user));
      } catch {}
    }
  };

  const logoutStaff = () => {
    setIsStaffLoggedIn(false);
  };

  const addStaffUser = (userData: Omit<StaffUser, 'id'>) => {
    const newUser: StaffUser = {
      ...userData,
      id: `staff-${Date.now()}`
    };
    setStaffUsers(prev => [...prev, newUser]);
  };

  const updateStaffUser = (updatedUser: StaffUser) => {
    setStaffUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (activeStaff?.id === updatedUser.id) {
      setActiveStaff(updatedUser);
      setActiveCashier(updatedUser.name);
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updatedUser));
      } catch {}
    }
  };

  const deleteStaffUser = (id: string): { success: boolean; message: string } => {
    if (activeStaff?.id === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang aktif digunakan saat ini.' };
    }
    const targetUser = staffUsers.find(u => u.id === id);
    if (targetUser?.role === 'manager') {
      const managerCount = staffUsers.filter(u => u.role === 'manager').length;
      if (managerCount <= 1) {
        return { success: false, message: 'Minimal harus ada 1 akun Manajer dalam sistem.' };
      }
    }
    setStaffUsers(prev => prev.filter(u => u.id !== id));
    return { success: true, message: 'Akun staf berhasil dihapus.' };
  };

  const resetStaffPin = (id: string, newPin: string): boolean => {
    if (!/^\d{4,6}$/.test(newPin.trim())) return false;
    setStaffUsers(prev => prev.map(u => u.id === id ? { ...u, pin: newPin.trim() } : u));
    if (activeStaff?.id === id) {
      setActiveStaff(prev => prev ? { ...prev, pin: newPin.trim() } : prev);
    }
    return true;
  };

  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR) === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(next));
      } catch {}
      return next;
    });
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    soundFx.enabled = val;
  };

  const setActiveCashier = (name: string) => {
    setActiveCashierState(name);
    try {
      localStorage.setItem(STORAGE_KEYS.CASHIER, name);
    } catch {
      // ignore
    }
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(currentShift));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [currentShift]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHEETS_CFG, JSON.stringify(sheetsConfig));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [sheetsConfig]);

  // Init Firebase Auth
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsGoogleAuthenticated(!!token);
        setIsAuthLoading(false);
        if (token) {
          loadDriveFiles(token);
        }
      },
      () => {
        setGoogleUser(null);
        setIsGoogleAuthenticated(false);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDriveFiles = async (token?: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) return;
    setIsLoadingDrive(true);
    try {
      const files = await listCafeDriveFiles(activeToken);
      setDriveFiles(files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const refreshDriveFiles = async () => {
    const token = await getAccessToken();
    if (token) {
      await loadDriveFiles(token);
    }
  };

  // Google sign in & out
  const loginGoogle = async () => {
    try {
      setIsAuthLoading(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setIsGoogleAuthenticated(true);
        await loadDriveFiles(res.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutGoogle = async () => {
    await fbLogout();
    setGoogleUser(null);
    setIsGoogleAuthenticated(false);
    setDriveFiles([]);
  };

  // Cart calculations
  const subtotalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = Math.round(subtotalAmount * (discountPercent / 100));
  const subtotalAfterDiscount = Math.max(0, subtotalAmount - discountAmount);
  const taxAmount = cafeSettings.taxEnabled 
    ? Math.round(subtotalAfterDiscount * (cafeSettings.taxRate / 100)) 
    : 0;
  const serviceChargeAmount = cafeSettings.serviceChargeEnabled 
    ? Math.round(subtotalAfterDiscount * (cafeSettings.serviceChargeRate / 100)) 
    : 0;
  const totalAmount = subtotalAfterDiscount + taxAmount + serviceChargeAmount;

  const addToCart = (item: MenuItem, options: SelectedOptions = {}) => {
    soundFx.playItemBeep();
    const extraTotal = (options.extras || []).reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = item.price + extraTotal;

    // Check if matching cart item already exists
    const existingIndex = cart.findIndex(c => 
      c.menuItem.id === item.id && 
      c.selectedOptions.temperature === options.temperature &&
      c.selectedOptions.sugar === options.sugar &&
      JSON.stringify(c.selectedOptions.extras) === JSON.stringify(options.extras) &&
      c.selectedOptions.notes === options.notes
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuItem: item,
        quantity: 1,
        selectedOptions: options,
        unitPrice,
        totalPrice: unitPrice
      };
      setCart(prev => [...prev, newCartItem]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    soundFx.playTap();
    setCart(prev => prev.filter(c => c.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    soundFx.playTap();
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountPercent(0);
    setOrderNotes('');
    setCustomerName('');
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setDiscountCode('');
      setDiscountPercent(0);
      return { success: false, message: 'Kode promo dikosongkan' };
    }

    if (trimmed === 'SENJA10' || trimmed === 'SENJA') {
      setDiscountCode(trimmed);
      setDiscountPercent(10);
      return { success: true, message: 'Diskon 10% Komunitas Senja berhasil digunakan!' };
    } else if (trimmed === 'HAPPYHOUR') {
      setDiscountCode(trimmed);
      setDiscountPercent(15);
      return { success: true, message: 'Diskon Happy Hour 15% aktif!' };
    } else if (trimmed === 'BARISTA') {
      setDiscountCode(trimmed);
      setDiscountPercent(20);
      return { success: true, message: 'Diskon Spesial Kerabat Barista 20%!' };
    } else {
      return { success: false, message: 'Kode promo tidak valid atau telah berakhir.' };
    }
  };

  // Orders creation
  const createOrder = (paymentMethod: PaymentMethod, amountPaid: number): Order => {
    if (cart.length === 0) {
      throw new Error('Keranjang belanja kosong');
    }

    const nextOrderNum = `KS-${(orders.length + 101)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNum,
      timestamp: new Date().toISOString(),
      type: orderType,
      tableNumber: orderType === 'dine_in' ? selectedTableNumber : undefined,
      customerName: customerName.trim() || (orderType === 'dine_in' ? `Tamu Meja ${selectedTableNumber}` : 'Takeaway Customer'),
      customerNotes: orderNotes.trim() || undefined,
      items: [...cart],
      subtotal: subtotalAmount,
      discount: discountAmount,
      discountCode: discountCode || undefined,
      tax: taxAmount,
      serviceCharge: serviceChargeAmount,
      totalAmount,
      paymentMethod,
      amountPaid: Math.max(amountPaid, totalAmount),
      change: Math.max(0, amountPaid - totalAmount),
      status: 'pending', // Sent to Kitchen Display
      cashierName: activeCashier,
      syncedToSheets: false
    };

    // Update stock & sold count
    setMenuItems(prev => 
      prev.map(menuItem => {
        const cartItem = cart.find(c => c.menuItem.id === menuItem.id);
        if (cartItem) {
          const newStock = Math.max(0, menuItem.stock - cartItem.quantity);
          return {
            ...menuItem,
            stock: newStock,
            soldCount: menuItem.soldCount + cartItem.quantity,
            isAvailable: newStock > 0
          };
        }
        return menuItem;
      })
    );

    // Update table status if dine-in
    if (orderType === 'dine_in' && selectedTableNumber) {
      setTables(prev => 
        prev.map(tbl => 
          tbl.number === selectedTableNumber
            ? {
                ...tbl,
                status: 'occupied',
                currentOrderId: newOrder.orderNumber,
                occupiedSince: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              }
            : tbl
        )
      );
    }

    // Update shift metrics
    setCurrentShift(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + 1,
      totalRevenue: prev.totalRevenue + totalAmount
    }));

    // Add to orders
    setOrders(prev => [newOrder, ...prev]);

    // Audio & visuals
    soundFx.playPaymentSuccess();
    setTimeout(() => {
      soundFx.playKitchenBell();
    }, 450);

    // Auto sync to sheets if enabled & token exists
    if (sheetsConfig.autoSync && sheetsConfig.spreadsheetId) {
      getAccessToken().then(token => {
        if (token && sheetsConfig.spreadsheetId) {
          appendOrderToSpreadsheet(token, sheetsConfig.spreadsheetId, newOrder)
            .then(ok => {
              if (ok) {
                setOrders(curr => 
                  curr.map(o => o.id === newOrder.id ? { ...o, syncedToSheets: true } : o)
                );
              }
            })
            .catch(console.error);
        }
      });
    }

    clearCart();
    setActiveReceiptOrder(newOrder);
    return newOrder;
  };

  const createDirectOrder = (data: {
    tableNumber?: string;
    type?: OrderType;
    customerName?: string;
    customerNotes?: string;
    items: CartItem[];
    subtotal: number;
    discount?: number;
    discountCode?: string;
    tax: number;
    serviceCharge: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
    cashierName?: string;
  }): Order => {
    if (!data.items || data.items.length === 0) {
      throw new Error('Pesanan tidak memiliki menu');
    }

    const nextOrderNum = `KS-${(orders.length + 101)}`;
    const finalAmountPaid = data.amountPaid ?? data.totalAmount;
    const finalChange = Math.max(0, finalAmountPaid - data.totalAmount);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: nextOrderNum,
      timestamp: new Date().toISOString(),
      type: data.type || (data.tableNumber ? 'dine_in' : 'takeaway'),
      tableNumber: data.tableNumber,
      customerName: data.customerName?.trim() || (data.tableNumber ? `Tamu Meja ${data.tableNumber}` : 'Pelanggan Kafe'),
      customerNotes: data.customerNotes?.trim() || undefined,
      items: [...data.items],
      subtotal: data.subtotal,
      discount: data.discount || 0,
      discountCode: data.discountCode || undefined,
      tax: data.tax,
      serviceCharge: data.serviceCharge,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      amountPaid: Math.max(finalAmountPaid, data.totalAmount),
      change: finalChange,
      status: 'pending', // Sent directly to Kitchen Display System (KDS)
      cashierName: data.cashierName || activeCashier,
      syncedToSheets: false
    };

    // Update stock & sold count
    setMenuItems(prev =>
      prev.map(menuItem => {
        const orderedItem = data.items.find(c => c.menuItem.id === menuItem.id);
        if (orderedItem) {
          const newStock = Math.max(0, menuItem.stock - orderedItem.quantity);
          return {
            ...menuItem,
            stock: newStock,
            soldCount: menuItem.soldCount + orderedItem.quantity,
            isAvailable: newStock > 0
          };
        }
        return menuItem;
      })
    );

    // Update table status if tableNumber is set
    if (data.tableNumber) {
      setTables(prev =>
        prev.map(tbl =>
          tbl.number === data.tableNumber
            ? {
                ...tbl,
                status: 'occupied',
                currentOrderId: newOrder.orderNumber,
                occupiedSince: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              }
            : tbl
        )
      );
    }

    // Update shift metrics
    setCurrentShift(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + 1,
      totalRevenue: prev.totalRevenue + data.totalAmount
    }));

    // Add to orders
    setOrders(prev => [newOrder, ...prev]);

    // Audio & visuals
    soundFx.playPaymentSuccess();
    setTimeout(() => {
      soundFx.playKitchenBell();
    }, 450);

    // Auto sync to sheets if enabled
    if (sheetsConfig.autoSync && sheetsConfig.spreadsheetId) {
      getAccessToken().then(token => {
        if (token && sheetsConfig.spreadsheetId) {
          appendOrderToSpreadsheet(token, sheetsConfig.spreadsheetId, newOrder)
            .then(ok => {
              if (ok) {
                setOrders(curr =>
                  curr.map(o => (o.id === newOrder.id ? { ...o, syncedToSheets: true } : o))
                );
              }
            })
            .catch(console.error);
        }
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    soundFx.playTap();
    setOrders(prev => 
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = { ...ord, status };
          if (status === 'ready') {
            soundFx.playKitchenBell();
            updated.kitchenPreparedAt = new Date().toISOString();
          } else if (status === 'completed') {
            updated.completedAt = new Date().toISOString();
            // Free up table if dine in
            if (ord.tableNumber) {
              setTables(tList => 
                tList.map(t => 
                  t.number === ord.tableNumber ? { ...t, status: 'cleaning', currentOrderId: undefined } : t
                )
              );
            }
          }
          return updated;
        }
        return ord;
      })
    );
  };

  // Tables management
  const updateTableStatus = (tableId: string, status: CafeTable['status']) => {
    setTables(prev => 
      prev.map(t => t.id === tableId ? { ...t, status } : t)
    );
  };

  const transferTable = (fromTableNumber: string, toTableNumber: string) => {
    setTables(prev => {
      const from = prev.find(t => t.number === fromTableNumber);
      if (!from) return prev;
      return prev.map(t => {
        if (t.number === fromTableNumber) {
          return { ...t, status: 'available', currentOrderId: undefined, occupiedSince: undefined };
        }
        if (t.number === toTableNumber) {
          return {
            ...t,
            status: 'occupied',
            currentOrderId: from.currentOrderId,
            occupiedSince: from.occupiedSince || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          };
        }
        return t;
      });
    });

    // Update orders that were on this table
    setOrders(prev => 
      prev.map(o => o.tableNumber === fromTableNumber && o.status !== 'completed' ? { ...o, tableNumber: toTableNumber } : o)
    );
  };

  const clearTableBill = (tableNumber: string) => {
    setTables(prev => 
      prev.map(t => t.number === tableNumber ? { ...t, status: 'available', currentOrderId: undefined, occupiedSince: undefined } : t)
    );
  };

  const openSelfOrderForTable = (tableNumber: string) => {
    setTargetSelfOrderTable(tableNumber);
    setActiveTab('selforder');
  };

  const settleTableOrder = (tableNumber: string, paymentMethod: PaymentMethod, amountPaid?: number): Order | null => {
    const activeOrder = orders.find(
      o => o.tableNumber === tableNumber && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
    );

    if (!activeOrder) {
      clearTableBill(tableNumber);
      return null;
    }

    const finalPaid = Math.max(amountPaid ?? activeOrder.totalAmount, activeOrder.totalAmount);
    const change = Math.max(0, finalPaid - activeOrder.totalAmount);

    const updatedOrder: Order = {
      ...activeOrder,
      paymentMethod,
      amountPaid: finalPaid,
      change,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));

    // Update shift revenue if it was a self-order or not yet counted
    setCurrentShift(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + (activeOrder.status === 'pending' ? 0 : 0)
    }));

    // Free up table (set to cleaning or available)
    setTables(prev => 
      prev.map(t => 
        t.number === tableNumber 
          ? { ...t, status: 'available', currentOrderId: undefined, occupiedSince: undefined }
          : t
      )
    );

    soundFx.playPaymentSuccess();
    setActiveReceiptOrder(updatedOrder);

    // Auto sync to sheets if enabled
    if (sheetsConfig.autoSync && sheetsConfig.spreadsheetId) {
      getAccessToken().then(token => {
        if (token && sheetsConfig.spreadsheetId) {
          appendOrderToSpreadsheet(token, sheetsConfig.spreadsheetId, updatedOrder)
            .catch(err => console.error('Sheet sync error:', err));
        }
      });
    }

    return updatedOrder;
  };

  // Menu items CRUD
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'soldCount'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
      soldCount: 0
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === item.id ? item : m));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => 
      prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)
    );
  };

  const updateItemStock = (id: string, newStock: number) => {
    setMenuItems(prev => 
      prev.map(m => m.id === id ? { ...m, stock: Math.max(0, newStock), isAvailable: newStock > 0 } : m)
    );
  };

  // Shift management
  const startNewShift = (cashierName: string, openingCash: number) => {
    const newShift: CashierShift = {
      id: `shift-${Date.now()}`,
      cashierName,
      startTime: new Date().toISOString(),
      openingCash,
      totalTransactions: 0,
      totalRevenue: 0,
      isOpen: true
    };
    setCurrentShift(newShift);
    setActiveCashier(cashierName);
  };

  const closeCurrentShift = (actualClosingCash: number, notes?: string) => {
    const expectedCash = currentShift.openingCash + currentShift.totalRevenue;
    const diff = actualClosingCash - expectedCash;

    setCurrentShift(prev => ({
      ...prev,
      isOpen: false,
      endTime: new Date().toISOString(),
      closingCash: actualClosingCash,
      expectedCash,
      cashDifference: diff,
      notes
    }));
  };

  // Google Sheets integration actions
  const updateSheetsConfig = (cfg: Partial<GoogleSheetsConfig>) => {
    setSheetsConfig(prev => ({ ...prev, ...cfg }));
  };

  const connectGoogleSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu');
    }
    const res = await createCafeSpreadsheet(token);
    setSheetsConfig({
      spreadsheetId: res.id,
      spreadsheetUrl: res.url,
      spreadsheetTitle: res.title,
      lastSyncedAt: new Date().toISOString(),
      autoSync: true
    });
    // Sync current orders and menu to it
    await syncBulkOrdersToSpreadsheet(token, res.id, orders);
    await syncMenuStockToSpreadsheet(token, res.id, menuItems);
    await syncDailySummaryToSpreadsheet(token, res.id, orders, menuItems);
  };

  const syncAllToGoogleSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, count: 0, message: 'Google OAuth token belum aktif. Silakan login kembali.' };
    }

    let targetSpreadsheetId = sheetsConfig.spreadsheetId;
    if (!targetSpreadsheetId) {
      const created = await createCafeSpreadsheet(token);
      targetSpreadsheetId = created.id;
      setSheetsConfig(prev => ({
        ...prev,
        spreadsheetId: created.id,
        spreadsheetUrl: created.url,
        spreadsheetTitle: created.title
      }));
    }

    try {
      const count = await syncBulkOrdersToSpreadsheet(token, targetSpreadsheetId, orders);
      await syncMenuStockToSpreadsheet(token, targetSpreadsheetId, menuItems);
      await syncDailySummaryToSpreadsheet(token, targetSpreadsheetId, orders, menuItems);

      setOrders(prev => prev.map(o => ({ ...o, syncedToSheets: true })));
      setSheetsConfig(prev => ({ ...prev, lastSyncedAt: new Date().toISOString() }));

      return {
        success: true,
        count,
        message: `Berhasil sinkron ${count} transaksi, katalog menu & stok, dan ringkasan ke Google Sheets!`
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat sinkronisasi';
      return { success: false, count: 0, message };
    }
  };

  // Google Drive actions
  const createDriveBackup = async () => {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, message: 'Silakan login dengan Google terlebih dahulu.' };
    }

    const payload = {
      app: 'Kopi Senja Cafe POS',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      cashier: activeCashier,
      shift: currentShift,
      menuItems,
      orders,
      tables
    };

    try {
      const res = await uploadBackupToDrive(token, payload);
      await refreshDriveFiles();
      return {
        success: true,
        message: `Cadangan data cafe berhasil disimpan ke Google Drive (${res.name})`,
        link: res.webViewLink
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat backup di Drive';
      return { success: false, message };
    }
  };

  const saveReceiptToGoogleDrive = async (order: Order, htmlContent: string): Promise<string> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu');
    }

    const res = await uploadReceiptToDrive(token, order, htmlContent);
    await refreshDriveFiles();
    return res.webViewLink || `https://drive.google.com/file/d/${res.id}/view`;
  };

  // Destructive delete file from Google Drive (Mandatory user confirmation)
  const deleteDriveItem = async (fileId: string, fileName: string) => {
    showConfirmModal({
      title: 'Hapus Berkas dari Google Drive?',
      message: `Apakah Anda yakin ingin menghapus berkas "${fileName}" dari Google Drive Anda? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Hapus Berkas',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('Google token expired');
        }
        await deleteDriveFile(token, fileId);
        await refreshDriveFiles();
      }
    });
  };

  // Confirmation modal helpers
  const showConfirmModal = (config: Omit<DestructiveConfirmConfig, 'isOpen'>) => {
    setConfirmModal({
      ...config,
      isOpen: true
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const resetToDemoData = () => {
    showConfirmModal({
      title: 'Reset ke Data Bawaan Kafe?',
      message: 'Semua perubahan katalog menu, pesanan aktif, denah meja, pengaturan, dan akun staf akan dikembalikan ke kondisi demo awal. Yakin ingin melanjutkan?',
      confirmLabel: 'Ya, Reset Data',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        try {
          localStorage.removeItem(STORAGE_KEYS.MENU);
          localStorage.removeItem(STORAGE_KEYS.ORDERS);
          localStorage.removeItem(STORAGE_KEYS.TABLES);
          localStorage.removeItem(STORAGE_KEYS.STAFF_USERS);
          localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        } catch {}
        setMenuItems(INITIAL_MENU_ITEMS);
        setOrders(INITIAL_ORDERS);
        setTables(INITIAL_TABLES);
        setStaffUsers(DEFAULT_STAFF_USERS);
        setActiveStaff(DEFAULT_STAFF_USERS[0]);
        setCafeSettings(DEFAULT_CAFE_SETTINGS);
        setCart([]);
        setActiveTab('pos');
        soundFx.playPaymentSuccess();
      }
    });
  };

  return (
    <CafeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        soundEnabled,
        setSoundEnabled,
        theme,
        toggleTheme,
        cafeSettings,
        updateCafeSettings,
        staffUsers,
        activeStaff,
        isStaffLoggedIn,
        loginStaff,
        loginStaffById,
        logoutStaff,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        resetStaffPin,
        rolePermissions: ROLE_PERMISSIONS,
        hasTabPermission,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        updateItemStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orderType,
        setOrderType,
        selectedTableNumber,
        setSelectedTableNumber,
        customerName,
        setCustomerName,
        orderNotes,
        setOrderNotes,
        discountCode,
        setDiscountCode,
        discountAmount,
        taxAmount,
        serviceChargeAmount,
        subtotalAmount,
        totalAmount,
        applyPromoCode,
        orders,
        createOrder,
        createDirectOrder,
        updateOrderStatus,
        tables,
        updateTableStatus,
        transferTable,
        clearTableBill,
        settleTableOrder,
        targetSelfOrderTable,
        setTargetSelfOrderTable,
        openSelfOrderForTable,
        activeCashier,
        setActiveCashier,
        currentShift,
        startNewShift,
        closeCurrentShift,
        googleUser,
        isGoogleAuthenticated,
        isAuthLoading,
        loginGoogle,
        logoutGoogle,
        sheetsConfig,
        updateSheetsConfig,
        connectGoogleSheet,
        syncAllToGoogleSheets,
        driveFiles,
        isLoadingDrive,
        refreshDriveFiles,
        createDriveBackup,
        deleteDriveItem,
        saveReceiptToGoogleDrive,
        activeReceiptOrder,
        setActiveReceiptOrder,
        confirmModal,
        showConfirmModal,
        closeConfirmModal,
        resetToDemoData
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
