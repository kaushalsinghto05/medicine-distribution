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
  const { currentTenant, tenantReturnRequests, tenantOrders, tenantWasteReturnRequests } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle sticky top-24 space-y-5">
            {/* Active Tenant Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${currentTenant.logoColor}`}></div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 block truncate">
                    {currentTenant.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    DL: {currentTenant.drugLicenseNumber}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Tenant Workspace</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {currentTenant.id}
                </span>
              </div>
            </div>

            {/* Grouped Nav Links */}
            <nav className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? item.isHazard
                                ? 'border-l-4 border-l-amber-500 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                                : 'border-l-4 border-l-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs'
                              : item.isHazard
                              ? 'text-amber-800/80 hover:text-amber-950 hover:bg-amber-50/40'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? item.isHazard
                                    ? 'text-amber-600'
                                    : 'text-indigo-600'
                                  : item.isHazard
                                  ? 'text-amber-500'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.alertBadge && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                  item.isHazard
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.alertBadge}
                              </span>
                            )}
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
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
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Multi-tenant encrypted isolation active</span>
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
