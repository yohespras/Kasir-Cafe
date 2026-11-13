import React, { useEffect, useState } from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/Navbar';
import { PosView } from './components/pos/PosView';
import { TablesView } from './components/tables/TablesView';
import { KitchenDisplayView } from './components/kds/KitchenDisplayView';
import { MenuManagementView } from './components/menu/MenuManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { GoogleIntegrationView } from './components/google/GoogleIntegrationView';
import { CustomerSelfOrderView } from './components/selforder/CustomerSelfOrderView';
import { UsersManagementView } from './components/users/UsersManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { ShiftModal } from './components/modals/ShiftModal';
import { StaffLoginView } from './components/auth/StaffLoginView';

const CafeAppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeReceiptOrder, 
    setActiveReceiptOrder,
    isStaffLoggedIn,
    theme,
    hasTabPermission,
    activeStaff
  } = useCafe();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Keyboard shortcut support for fast POS navigation (1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1' && hasTabPermission('pos')) setActiveTab('pos');
      if (e.key === '2' && hasTabPermission('tables')) setActiveTab('tables');
      if (e.key === '3' && hasTabPermission('kds')) setActiveTab('kds');
      if (e.key === '4' && hasTabPermission('menu')) setActiveTab('menu');
      if (e.key === '5' && hasTabPermission('reports')) setActiveTab('reports');
      if (e.key === '6' && hasTabPermission('users')) setActiveTab('users');
      if (e.key === '7' && hasTabPermission('settings')) setActiveTab('settings');
      if (e.key === '8' && hasTabPermission('google')) setActiveTab('google');
      if (e.key === '9' && hasTabPermission('selforder')) setActiveTab('selforder');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, hasTabPermission]);

  // If staff is locked out, show the login view
  if (!isStaffLoggedIn) {
    return <StaffLoginView />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans select-none transition-colors duration-200 ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Side Bar Navigation */}
      <Sidebar onOpenShiftModal={() => setIsShiftModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* Top Header */}
        <Navbar />

        {/* Active Page View Container */}
        <main className={`flex-1 flex flex-col overflow-hidden min-h-0 ${
          isDark ? 'bg-stone-950' : 'bg-[#faf7f2]'
        }`}>
          {activeTab === 'pos' && hasTabPermission('pos') && <PosView />}
          {activeTab === 'tables' && hasTabPermission('tables') && <TablesView />}
          {activeTab === 'kds' && hasTabPermission('kds') && <KitchenDisplayView />}
          {activeTab === 'menu' && hasTabPermission('menu') && <MenuManagementView />}
          {activeTab === 'reports' && hasTabPermission('reports') && <ReportsView />}
          {activeTab === 'users' && hasTabPermission('users') && <UsersManagementView />}
          {activeTab === 'settings' && hasTabPermission('settings') && <SettingsView />}
          {activeTab === 'google' && hasTabPermission('google') && <GoogleIntegrationView />}
          {activeTab === 'selforder' && hasTabPermission('selforder') && <CustomerSelfOrderView />}
        </main>
      </div>

      {/* Global Thermal Receipt Modal */}
      <ReceiptModal
        order={activeReceiptOrder}
        onClose={() => setActiveReceiptOrder(null)}
      />

      {/* Mandatory Safety Confirmation Modal */}
      <ConfirmationModal />

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <CafeAppContent />
    </CafeProvider>
  );
}
