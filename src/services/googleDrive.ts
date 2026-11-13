import { DriveBackupFile, Order } from '../types/cafe';

const DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

export async function listCafeDriveFiles(accessToken: string): Promise<DriveBackupFile[]> {
  try {
    const q = encodeURIComponent("name contains 'Kopi_Senja' and trashed = false");
    const fields = encodeURIComponent('files(id, name, createdTime, size, webViewLink, mimeType)');
    const url = `${DRIVE_FILES_API}?q=${q}&fields=${fields}&orderBy=createdTime desc&pageSize=30`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal memuat berkas dari Google Drive');
    }

    const data = await response.json();
    return (data.files || []).map((f: { id: string; name: string; createdTime: string; size?: string; webViewLink?: string; mimeType?: string }) => ({
      id: f.id,
      name: f.name,
      createdTime: f.createdTime,
      size: f.size ? `${(parseInt(f.size, 10) / 1024).toFixed(1)} KB` : 'N/A',
      webViewLink: f.webViewLink,
      type: f.name.endsWith('.json') ? 'backup_json' : 'receipt_html'
    }));
  } catch (error) {
    console.error('List Drive files error:', error);
    return [];
  }
}

export async function uploadReceiptToDrive(
  accessToken: string,
  order: Order,
  receiptHtmlContent: string
): Promise<{ id: string; webViewLink?: string }> {
  const fileName = `Kopi_Senja_Struk_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.html`;

  const metadata = {
    name: fileName,
    mimeType: 'text/html',
    description: `Struk Transaksi POS Kopi Senja #${order.orderNumber} - Rp ${order.totalAmount.toLocaleString('id-ID')}`
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html\r\n\r\n' +
    receiptHtmlContent +
    closeDelimiter;

  const response = await fetch(DRIVE_UPLOAD_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal menyimpan struk ke Google Drive');
  }

  const result = await response.json();
  return {
    id: result.id,
    webViewLink: `https://drive.google.com/file/d/${result.id}/view`
  };
}

export async function uploadBackupToDrive(
  accessToken: string,
  backupPayload: Record<string, unknown>
): Promise<{ id: string; webViewLink?: string; name: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Kopi_Senja_Backup_${timestamp}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Cadangan data penuh Kopi Senja POS (Menu, Transaksi, Meja, dan Shift)'
  };

  const fileContent = JSON.stringify(backupPayload, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(DRIVE_UPLOAD_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal membuat backup di Google Drive');
  }

  const result = await response.json();
  return {
    id: result.id,
    webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
    name: fileName
  };
}

// NOTE: Caller MUST present user confirmation modal before invoking this destructive deletion!
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  const response = await fetch(`${DRIVE_FILES_API}/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal menghapus berkas dari Google Drive');
  }

  return true;
}
