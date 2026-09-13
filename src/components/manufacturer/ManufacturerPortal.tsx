import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DashboardScreen } from './screens/DashboardScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { PricingScreen } from './screens/PricingScreen';
import { RulesScreen } from './screens/RulesScreen';
import { DistributorManagementScreen } from './screens/DistributorManagementScreen';
import { OrderManagementScreen } from './screens/OrderManagementScreen';
import { LogisticsScreen } from './screens/LogisticsScreen';
import {
  LayoutDashboard,
  Pill,
  TrendingUp,
  ShieldCheck,
  Users,
  PackageCheck,
  Truck,
} from 'lucide-react';

interface ManufacturerPortalProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const ManufacturerPortal: React.FC<ManufacturerPortalProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentTenant, tenantReturnRequests, tenantOrders } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const pendingReturnsCount = tenantReturnRequests.filter((r) => r.status === 'pending').length;
  const pendingOrdersCount = tenantOrders.filter((o) =>
    ['new', 'confirmed', 'processing', 'ready_for_dispatch'].includes(o.status)
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Medicine Catalog', icon: Pill },
    { id: 'pricing', label: 'Pricing & Slabs', icon: TrendingUp },
    { id: 'rules', label: 'Ordering Rules Engine', icon: ShieldCheck },
    { id: 'distributors', label: 'Distributor Network', icon: Users },
    {
      id: 'orders',
      label: 'Orders & Fulfilment',
      icon: PackageCheck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      alertBadge: pendingReturnsCount > 0 ? `${pendingReturnsCount} Return` : undefined,
    },
    { id: 'logistics', label: 'Logistics Partners', icon: Truck },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Navigation */}
        <aside
          className={`lg:w-64 shrink-0 ${
            mobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs sticky top-24 space-y-4">
            {/* Active Tenant Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentTenant.logoColor}`}></div>
                <span className="font-bold text-xs text-slate-900 leading-tight">
                  {currentTenant.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tenant ID: <strong className="font-mono text-slate-700">{currentTenant.id}</strong>
              </span>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.alertBadge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900">
                          {item.alertBadge}
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 p-2 leading-relaxed">
                Multi-tenant isolation strictly limits visibility to {currentTenant.shortName}’s data models only.
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
          {activeTab === 'catalog' && <CatalogScreen />}
          {activeTab === 'pricing' && <PricingScreen />}
          {activeTab === 'rules' && <RulesScreen />}
          {activeTab === 'distributors' && <DistributorManagementScreen />}
          {activeTab === 'orders' && <OrderManagementScreen />}
          {activeTab === 'logistics' && <LogisticsScreen />}
        </main>
      </div>
    </div>
  );
};
