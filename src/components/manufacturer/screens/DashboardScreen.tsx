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
  Building2,
  CheckCircle2,
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
    <div className="space-y-6">
      {/* 1. Trust & Credibility Stats Strip */}
      <TrustAndCredibilityBar variant="manufacturer" />

      {/* Welcome & Tenant Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Tenant Admin Dashboard
            </span>
            <span className="text-xs text-slate-500 font-mono">DL: {currentTenant.drugLicenseNumber}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{currentTenant.name}</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {currentTenant.tagline} • Multi-tenant isolated workspace for catalog, pricing, and distribution rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Pill className="w-4 h-4" />}
            onClick={() => onNavigateTab('catalog')}
          >
            Manage Catalog
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<PackageCheck className="w-4 h-4" />}
            onClick={() => onNavigateTab('orders')}
          >
            Orders & Shipments ({ordersNeedingAction.length})
          </Button>
        </div>
      </div>

      {/* Pending Return Action Alert (If any) */}
      {pendingReturnRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">
                  {pendingReturnRequests.length} Pending Distributor Return Claim(s)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wider">
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
            Review in Returns Queue
          </Button>
        </div>
      )}

      {/* 5. Redesigned Metric Cards with Tabular Numbers & Staggered Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Active SKUs"
          value={activeMedicinesCount}
          icon={Pill}
          color="sky"
          subtext={`${tenantMedicines.length} total formulations`}
          onClick={() => onNavigateTab('catalog')}
          className="animate-fade-slide"
        />

        <MetricCard
          label="Low Stock Batches"
          value={lowStockBatchesCount}
          icon={AlertTriangle}
          color="amber"
          subtext="Batches ≤ 2,000 units"
          onClick={() => onNavigateTab('catalog')}
          className="animate-fade-slide [animation-delay:60ms]"
        />

        <MetricCard
          label="Orders In Queue"
          value={ordersNeedingAction.length}
          icon={Clock}
          color="indigo"
          subtext="New / Confirmed / Processing"
          onClick={() => onNavigateTab('orders')}
          className="animate-fade-slide [animation-delay:120ms]"
        />

        <MetricCard
          label="Pending Returns"
          value={pendingReturnRequests.length}
          icon={RotateCcw}
          color="rose"
          subtext="Awaiting QA evaluation"
          onClick={() => onNavigateTab('orders')}
          className="animate-fade-slide [animation-delay:180ms]"
        />

        <MetricCard
          label="Gross Order Value"
          value={formatCurrency(thisMonthOrderValue)}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: '+14.2%', isPositive: true, label: 'this month' }}
          className="animate-fade-slide [animation-delay:240ms]"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Orders</h3>
            <p className="text-xs text-slate-500">Live feed of orders received from authorized distributors</p>
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
          <div className="p-8 text-center text-slate-400 text-xs">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Distributor</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((ord) => {
                  const dist = tenantDistributors.find((d) => d.id === ord.distributorId);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="py-3 px-4 font-semibold">{dist?.name || ord.distributorId}</td>
                      <td className="py-3 px-4">
                        {ord.items.length} item(s) (
                        <span className="tabular-nums">
                          {ord.items.reduce((s, i) => s + (i.fulfilledQuantity || i.requestedQuantity), 0)}
                        </span>{' '}
                        units)
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onNavigateTab('orders')}
                          className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        >
                          Details →
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
