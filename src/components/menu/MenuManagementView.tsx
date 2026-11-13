import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign, 
  Coffee 
} from 'lucide-react';
import { MenuItem, CategoryType } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

export const MenuManagementView: React.FC = () => {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    toggleItemAvailability, 
    updateItemStock,
    showConfirmModal,
    theme,
    activeStaff,
    rolePermissions
  } = useCafe();

  const canManageCatalog = rolePermissions[activeStaff?.role || 'kasir']?.canEditMenuPricing;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const isDark = theme === 'dark';

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('coffee');
  const [price, setPrice] = useState(25000);
  const [costPrice, setCostPrice] = useState(10000);
  const [stock, setStock] = useState(30);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');

  const filteredItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockCount = menuItems.filter(m => m.stock > 0 && m.stock <= 5).length;
  const soldOutCount = menuItems.filter(m => !m.isAvailable || m.stock <= 0).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('coffee');
    setPrice(25000);
    setCostPrice(10000);
    setStock(30);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80');
    setBadge('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setCostPrice(item.costPrice);
    setStock(item.stock);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setBadge(item.badge || '');
    setIsFormModalOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    showConfirmModal({
      title: 'Hapus Menu Kafe?',
      message: `Apakah Anda yakin ingin menghapus "${item.name}" dari daftar katalog menu?`,
      confirmLabel: 'Hapus Menu',
      isDestructive: true,
      onConfirm: () => {
        deleteMenuItem(item.id);
      }
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name,
        category,
        price,
        costPrice,
        stock,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
        badge: badge.trim() || undefined,
        isAvailable: stock > 0
      });
    } else {
      addMenuItem({
        name,
        category,
        price,
        costPrice,
        stock,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
        badge: badge.trim() || undefined,
        isAvailable: stock > 0
      });
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Header & Overview Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Katalog Menu & Manajemen Stok</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {canManageCatalog 
              ? 'Kelola harga jual, modal HPP, margin keuntungan, dan ketersediaan stok'
              : 'Pantau ketersediaan bahan, status habis/tersedia, dan jumlah sisa stok'}
          </p>
        </div>

        {canManageCatalog ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold">
            <span>Mode Staf: Kelola Stok & Ketersediaan</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Katalog Menu</span>
          <p className="text-2xl font-black mt-1">{menuItems.length} Produk</p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Menu Aktif Siap Jual</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {menuItems.filter(m => m.isAvailable && m.stock > 0).length} Menu
          </p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Stok Menipis (≤ 5)</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{lowStockCount} Menu</p>
        </div>
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Stok Habis (Kosong)</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{soldOutCount} Menu</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-stone-500' : 'text-stone-400'
          }`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari menu berdasarkan nama..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
              isDark ? 'bg-stone-900 border-stone-800 text-stone-200 placeholder-stone-500' : 'bg-white border-stone-300 text-stone-900 shadow-sm'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'signature', label: 'Signature' },
            { id: 'coffee', label: 'Coffee' },
            { id: 'manual_brew', label: 'Manual' },
            { id: 'non_coffee', label: 'Non-Coffee' },
            { id: 'food', label: 'Makanan' },
            { id: 'snack', label: 'Snack' },
            { id: 'dessert', label: 'Dessert' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-amber-500 border-amber-500 text-stone-950 font-black shadow-sm'
                  : isDark
                  ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Table */}
      <div className={`rounded-3xl overflow-hidden shadow-xl border ${
        isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
      }`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
            <thead className={`uppercase text-[10px] tracking-wider border-b ${
              isDark ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}>
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Jual</th>
                <th className="p-4">Modal (HPP)</th>
                <th className="p-4">Margin Laba</th>
                <th className="p-4">Terjual</th>
                <th className="p-4">Sisa Stok</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-stone-850' : 'divide-stone-100'}`}>
              {filteredItems.map(item => {
                const margin = item.price > 0 ? Math.round(((item.price - item.costPrice) / item.price) * 100) : 0;
                const isLow = item.stock > 0 && item.stock <= 5;
                const isOut = !item.isAvailable || item.stock <= 0;

                return (
                  <tr key={item.id} className={`transition-colors ${
                    isDark ? 'hover:bg-stone-850/50' : 'hover:bg-stone-50'
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-500/20"
                        />
                        <div>
                          <p className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{item.name}</p>
                          {item.badge && (
                            <span className="text-[10px] text-amber-500 font-semibold">{item.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 capitalize opacity-75">
                      {item.category.replace('_', ' ')}
                    </td>

                    <td className="p-4 font-bold text-amber-500">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>

                    <td className="p-4 opacity-75">
                      Rp {item.costPrice.toLocaleString('id-ID')}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {margin}%
                      </span>
                    </td>

                    <td className="p-4 font-bold">
                      {item.soldCount} porsi
                    </td>

                    {/* Stock with quick adjust */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateItemStock(item.id, item.stock - 1)}
                          disabled={item.stock <= 0}
                          className={`w-5 h-5 rounded font-bold text-xs flex items-center justify-center ${
                            isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                          }`}
                        >
                          -
                        </button>
                        <span className={`font-mono font-bold w-7 text-center ${
                          isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : ''
                        }`}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => updateItemStock(item.id, item.stock + 1)}
                          className={`w-5 h-5 rounded font-bold text-xs flex items-center justify-center ${
                            isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          !isOut
                            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                        }`}
                      >
                        {!isOut ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      {canManageCatalog ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800' : 'text-stone-500 hover:text-amber-600 hover:bg-stone-100'
                            }`}
                            title="Ubah Rincian"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800' : 'text-stone-500 hover:text-rose-600 hover:bg-stone-100'
                            }`}
                            title="Hapus Menu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-medium">Stok Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
              isDark ? 'border-stone-800' : 'border-stone-100'
            }`}>
              <h3 className="text-xl font-bold">
                {editingItem ? 'Ubah Menu Kafe' : 'Tambah Menu Kafe Baru'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Nama Menu</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Kopi Pandan Aren"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryType)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    <option value="signature">Signature Kopi</option>
                    <option value="coffee">Espresso Bar</option>
                    <option value="manual_brew">Manual Brew V60</option>
                    <option value="non_coffee">Non-Coffee & Tea</option>
                    <option value="food">Makanan Utama</option>
                    <option value="snack">Bites & Snack</option>
                    <option value="dessert">Pastry & Dessert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-500 border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Modal HPP (Rp)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={e => setCostPrice(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>URL Gambar Foto Produk</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Deskripsi Singkat</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ceritakan racikan rasa, bahan utama, atau tasting note kopi..."
                  rows={2}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Badge Spesial (Opsional)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="Best Seller / Favorit / Chef Pick"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
                isDark ? 'border-stone-800' : 'border-stone-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className={`px-4 py-2.5 text-xs font-medium ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-all shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
