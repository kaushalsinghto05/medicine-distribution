import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { TrustAndCredibilityBar } from '../../common/TrustAndCredibilityBar';
import { MetricCard } from '../../ui/MetricCard';
import { Button } from '../../ui/Button';
import {
  Pill,
  AlertTriangle,
  Clock,
  RotateCcw,
  TrendingUp,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const {
    currentTenant,
    tenantMedicines,
    tenantOrders,
    tenantReturnRequests,
    tenantDistributors,
  } = useStore();

  // Metrics computation
  const activeMedicinesCount = tenantMedicines.filter((m) => m.status === 'published').length;

  const lowStockBatchesCount = tenantMedicines.reduce((acc, med) => {
    const lowCount = med.batches.filter((b) => b.availableQuantity > 0 && b.availableQuantity <= 2000).length;
    return acc + lowCount;
  }, 0);

  const ordersNeedingAction = tenantOrders.filter((o) =>
    ['new', 'confirmed', 'processing', 'ready_for_dispatch'].includes(o.status)
  );

  const pendingReturnRequests = tenantReturnRequests.filter((r) => r.status === 'pending');

  const thisMonthOrderValue = tenantOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const recentOrders = [...tenantOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="manufacturer" />

      {/* Welcome & Tenant Banner: Denser, Flatter Operational Surface (8px radius, shadow-none) */}
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8F3F1] text-[#1A504C] border border-[#1A504C]/20 uppercase">
              Principal Operations
            </span>
            <span className="text-xs text-[#6B7280]">DL: {currentTenant.drugLicenseNumber}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-[#1A1A1A] mt-1 tracking-tight">
            {currentTenant.name}
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {currentTenant.tagline} • Multi-tenant workspace for formulation batches, PTR schedules & distributor orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Pill className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('catalog')}
          >
            Manage Catalog
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<PackageCheck className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('orders')}
          >
            Orders ({ordersNeedingAction.length})
          </Button>
        </div>
      </div>

      {/* Pending Return Action Alert (If any) */}
      {pendingReturnRequests.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading text-amber-950">
                  {pendingReturnRequests.length} Pending Distributor Return Claim(s)
                </h4>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Claims require QA inspection approval. Approved returns atomically restock batch inventory.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="hazard"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('orders')}
            className="shrink-0"
          >
            Review Returns Queue
          </Button>
        </div>
      )}

      {/* 5 Stat Cards with STRICT 3-Color Palette: Teal, Amber, Red */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Active SKUs: Teal (Brand Informational) */}
        <MetricCard
          label="Active SKUs"
          value={activeMedicinesCount}
          icon={Pill}
          color="teal"
          subtext={`${tenantMedicines.length} total formulations`}
          onClick={() => onNavigateTab('catalog')}
        />

        {/* 2. Low Stock Batches: Amber (Warning) */}
        <MetricCard
          label="Low Stock Batches"
          value={lowStockBatchesCount}
          icon={AlertTriangle}
          color="amber"
          subtext="Batches ≤ 2,000 units"
          onClick={() => onNavigateTab('catalog')}
        />

        {/* 3. Orders in Queue: Teal (Brand Informational) */}
        <MetricCard
          label="Orders In Queue"
          value={ordersNeedingAction.length}
          icon={Clock}
          color="teal"
          subtext="Pending processing / dispatch"
          onClick={() => onNavigateTab('orders')}
        />

        {/* 4. Pending Returns: Red (Action Required) */}
        <MetricCard
          label="Pending Returns"
          value={pendingReturnRequests.length}
          icon={RotateCcw}
          color="red"
          subtext="Awaiting QA evaluation"
          onClick={() => onNavigateTab('orders')}
        />

        {/* 5. Gross Order Value: Teal (Brand Informational) */}
        <MetricCard
          label="Gross Order Value"
          value={formatCurrency(thisMonthOrderValue)}
          icon={TrendingUp}
          color="teal"
          trend={{ value: '+14.2%', isPositive: true, label: 'this month' }}
        />
      </div>

      {/* Recent Orders Section: Dense Operational Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-heading text-[#1A1A1A]">Recent Orders Feed</h3>
            <p className="text-xs text-[#6B7280]">Live feed of orders received from authorized stockists</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('orders')}
          >
            View all orders
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F8F6] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Distributor</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#1A1A1A]">
                {recentOrders.map((ord) => {
                  const dist = tenantDistributors.find((d) => d.id === ord.distributorId);
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1A1A1A]">{ord.id}</td>
                      <td className="py-2.5 px-3 font-medium">{dist?.name || ord.distributorId}</td>
                      <td className="py-2.5 px-3 text-[#6B7280]">
                        {ord.items.length} item(s) (
                        <span className="tabular-nums font-semibold text-[#1A1A1A]">
                          {ord.items.reduce((s, i) => s + (i.fulfilledQuantity || i.requestedQuantity), 0)}
                        </span>{' '}
                        units)
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1A1A1A] tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-[#6B7280]">{formatDate(ord.createdAt)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigateTab('orders')}
                          className="text-[#1A504C] hover:underline font-bold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
