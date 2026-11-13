import { Order, MenuItem } from '../types/cafe';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface SpreadsheetDetails {
  id: string;
  url: string;
  title: string;
}

export async function createCafeSpreadsheet(accessToken: string): Promise<SpreadsheetDetails> {
  const title = `Kopi Senja POS - Pembukuan & Penjualan (${new Date().toLocaleDateString('id-ID')})`;
  
  const payload = {
    properties: {
      title,
      locale: 'id_ID',
      timeZone: 'Asia/Jakarta'
    },
    sheets: [
      {
        properties: {
          title: 'Transaksi_Kasir',
          gridProperties: { rowCount: 1000, columnCount: 15, frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'Menu_Dan_Stok',
          gridProperties: { rowCount: 100, columnCount: 8, frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'Ringkasan_Penjualan',
          gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 1 }
        }
      }
    ]
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal membuat spreadsheet: ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to sheets
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    url: spreadsheetUrl,
    title
  };
}

export async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  // Transaksi Kasir Headers
  const transHeaders = [
    'Waktu Transaksi',
    'No. Struk',
    'Tipe Pesanan',
    'Meja / Lokasi',
    'Pelanggan',
    'Rincian Menu (Qty x Item)',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Pajak PB1 (Rp)',
    'Total Bayar (Rp)',
    'Metode Pembayaran',
    'Uang Diterima',
    'Kembalian',
    'Kasir'
  ];

  // Menu Stok Headers
  const menuHeaders = [
    'ID Produk',
    'Nama Menu',
    'Kategori',
    'Harga Jual (Rp)',
    'Modal / HPP (Rp)',
    'Jumlah Terjual',
    'Sisa Stok',
    'Status Ketersediaan'
  ];

  // Ringkasan Headers
  const summaryHeaders = [
    'Tanggal Rekap',
    'Total Transaksi Selesai',
    'Total Omset Kotor (Rp)',
    'Total Diskon Diberikan (Rp)',
    'Omset Bersih (Rp)',
    'Estimasi Laba Kotor (Rp)',
    'Waktu Terakhir Sinkron'
  ];

  const batchBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Transaksi_Kasir!A1:N1',
        values: [transHeaders]
      },
      {
        range: 'Menu_Dan_Stok!A1:H1',
        values: [menuHeaders]
      },
      {
        range: 'Ringkasan_Penjualan!A1:G1',
        values: [summaryHeaders]
      }
    ]
  };

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batchBody)
  });
}

export async function appendOrderToSpreadsheet(
  accessToken: string, 
  spreadsheetId: string, 
  order: Order
): Promise<boolean> {
  const formattedItems = order.items
    .map(i => `${i.quantity}x ${i.menuItem.name}${i.selectedOptions.temperature ? ` (${i.selectedOptions.temperature})` : ''}`)
    .join('; ');

  const row = [
    new Date(order.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    order.orderNumber,
    order.type === 'dine_in' ? 'Dine In' : 'Takeaway',
    order.tableNumber || '-',
    order.customerName || 'Pelanggan',
    formattedItems,
    order.subtotal,
    order.discount,
    order.tax,
    order.totalAmount,
    order.paymentMethod.toUpperCase(),
    order.amountPaid,
    order.change,
    order.cashierName
  ];

  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/Transaksi_Kasir!A:N:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  return response.ok;
}

export async function syncBulkOrdersToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  orders: Order[]
): Promise<number> {
  if (orders.length === 0) return 0;

  const rows = orders.map(order => {
    const formattedItems = order.items
      .map(i => `${i.quantity}x ${i.menuItem.name}${i.selectedOptions.temperature ? ` (${i.selectedOptions.temperature})` : ''}`)
      .join('; ');

    return [
      new Date(order.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      order.orderNumber,
      order.type === 'dine_in' ? 'Dine In' : 'Takeaway',
      order.tableNumber || '-',
      order.customerName || 'Pelanggan',
      formattedItems,
      order.subtotal,
      order.discount,
      order.tax,
      order.totalAmount,
      order.paymentMethod.toUpperCase(),
      order.amountPaid,
      order.change,
      order.cashierName
    ];
  });

  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/Transaksi_Kasir!A:N:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal sinkron data pesanan ke Google Sheets');
  }

  return rows.length;
}

export async function syncMenuStockToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  menuItems: MenuItem[]
): Promise<boolean> {
  const rows = menuItems.map(item => [
    item.id,
    item.name,
    item.category,
    item.price,
    item.costPrice,
    item.soldCount,
    item.stock,
    item.isAvailable && item.stock > 0 ? 'Tersedia' : 'Habis'
  ]);

  // Update starting from A2
  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/Menu_Dan_Stok!A2:H${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  return response.ok;
}

export async function syncDailySummaryToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  orders: Order[],
  menuItems: MenuItem[]
): Promise<boolean> {
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalOmsetKotor = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDiskon = completedOrders.reduce((sum, o) => sum + o.discount, 0);
  const totalOmsetBersih = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Approximate COGS from sold items
  let totalCOGS = 0;
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const original = menuItems.find(m => m.id === item.menuItem.id);
      if (original) {
        totalCOGS += original.costPrice * item.quantity;
      }
    });
  });
  const estimasiLabaKotor = totalOmsetBersih - totalCOGS;

  const todayStr = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
  const row = [
    todayStr,
    completedOrders.length,
    totalOmsetKotor,
    totalDiskon,
    totalOmsetBersih,
    estimasiLabaKotor,
    new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })
  ];

  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/Ringkasan_Penjualan!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  return response.ok;
}
