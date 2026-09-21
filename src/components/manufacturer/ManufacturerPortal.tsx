import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DashboardScreen } from './screens/DashboardScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { PricingScreen } from './screens/PricingScreen';
import { RulesScreen } from './screens/RulesScreen';
import { DistributorManagementScreen } from './screens/DistributorManagementScreen';
import { OrderManagementScreen } from './screens/OrderManagementScreen';
import { LogisticsScreen } from './screens/LogisticsScreen';
import { WasteManagementScreen } from './screens/WasteManagementScreen';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import {
  LayoutDashboard,
  Pill,
  TrendingUp,
  ShieldCheck,
  Users,
  PackageCheck,
  Truck,
  AlertTriangle,
  Building2,
  Lock,
  Store,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  alertBadge?: string;
  isHazard?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface ManufacturerPortalProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const ManufacturerPortal: React.FC<ManufacturerPortalProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentTenant, tenantReturnRequests, tenantOrders, tenantWasteReturnRequests, navigateToPage, setPortalMode } = useStore();
  const [activeTab, setActiveTab] = useState<string>('orders');

  const pendingReturnsCount = tenantReturnRequests.filter((r) => r.status === 'pending').length;
  const pendingWasteReturnsCount = tenantWasteReturnRequests.filter(
    (r) => r.status === 'requested' || r.status === 'manufacturer_review'
  ).length;
  const pendingOrdersCount = tenantOrders.filter((o) =>
    ['new', 'confirmed', 'processing', 'ready_for_dispatch'].includes(o.status)
  ).length;

  const navSections: NavSection[] = [
    {
      title: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'catalog', label: 'Medicine Catalog', icon: Pill },
        {
          id: 'orders',
          label: 'Orders & Fulfilment',
          icon: PackageCheck,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          alertBadge: pendingReturnsCount > 0 ? `${pendingReturnsCount} Return` : undefined,
        },
      ],
    },
    {
      title: 'Commercial Policies',
      items: [
        { id: 'pricing', label: 'Pricing & Slabs', icon: TrendingUp },
        { id: 'rules', label: 'Ordering Rules Engine', icon: ShieldCheck },
      ],
    },
    {
      title: 'Distribution Network',
      items: [
        { id: 'distributors', label: 'Authorized Distributors', icon: Users },
        { id: 'logistics', label: 'Logistics Partners', icon: Truck },
      ],
    },
    {
      title: 'Compliance & Safety',
      items: [
        {
          id: 'waste',
          label: 'Waste & Expiry Management',
          icon: AlertTriangle,
          isHazard: true,
          alertBadge: pendingWasteReturnsCount > 0 ? `${pendingWasteReturnsCount} Claim` : undefined,
        },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // Find active item label for breadcrumbs
  const activeItem = navSections
    .flatMap((s) => s.items)
    .find((i) => i.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Persistent Desktop Sidebar Navigation */}
        <aside
          className={`lg:w-72 shrink-0 ${
            mobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs sticky top-24 space-y-5">
            {/* Quick Switch Button back to Wholesale Storefront */}
            <button
              type="button"
              onClick={() => {
                setPortalMode('distributor');
                navigateToPage('marketplace');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#E8F3F1] hover:bg-[#D5EAE5] text-[#1A504C] font-extrabold text-xs transition-colors border border-[#1A504C]/20"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#1A504C]" />
                <span>Switch to Buyer Storefront</span>
              </div>
              <span className="text-[10px]">➔</span>
            </button>

            {/* Active Tenant Card */}
            <div className="p-3.5 rounded-xl bg-[#F5F8F6] border border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full ${currentTenant.logoColor || 'bg-[#1A504C]'}`}></div>
                <div className="min-w-0 flex-1">
                  <span className="font-heading font-extrabold text-xs text-[#1A1A1A] block truncate">
                    {currentTenant.name}
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-mono block">
                    DL: {currentTenant.drugLicenseNumber}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px]">
                <span className="text-[#6B7280]">Tenant Workspace</span>
                <span className="font-mono font-bold text-[#1A504C] bg-white px-2 py-0.5 rounded border border-gray-200">
                  {currentTenant.id}
                </span>
              </div>
            </div>

            {/* Grouped Nav Links */}
            <nav className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="px-3 text-[10px] font-black text-[#6B7280] uppercase tracking-wider block">
                    {section.title}
                  </span>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#1A504C] text-white shadow-xs'
                              : item.isHazard
                              ? 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/60'
                              : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-[#F5F8F6]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? 'text-white'
                                  : item.isHazard
                                  ? 'text-amber-600'
                                  : 'text-[#6B7280]'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.alertBadge && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : item.isHazard
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.alertBadge}
                              </span>
                            )}
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#E8F3F1] text-[#1A504C]'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Tenant Isolation Reassurance */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[10px] text-[#6B7280] bg-[#F5F8F6] p-2.5 rounded-xl border border-gray-200">
                <Lock className="w-3.5 h-3.5 text-[#1A504C] shrink-0" />
                <span className="font-semibold">Multi-tenant encrypted isolation active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area with Top Breadcrumb Trail */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <Breadcrumbs
              items={[
                { label: 'Manufacturer Portal' },
                { label: activeItem?.label || 'Overview', isActive: true },
              ]}
            />
          </div>

          <div className="min-w-0">
            {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
            {activeTab === 'catalog' && <CatalogScreen />}
            {activeTab === 'pricing' && <PricingScreen />}
            {activeTab === 'rules' && <RulesScreen />}
            {activeTab === 'distributors' && <DistributorManagementScreen />}
            {activeTab === 'orders' && <OrderManagementScreen />}
            {activeTab === 'waste' && <WasteManagementScreen />}
            {activeTab === 'logistics' && <LogisticsScreen />}
          </div>
        </main>
      </div>
    </div>
  );
};
