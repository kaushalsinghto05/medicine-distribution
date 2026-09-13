import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import {
  Pill,
  AlertTriangle,
  Clock,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
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
    <div className="space-y-6">
      {/* Welcome & Tenant Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Tenant Admin Dashboard
            </span>
            <span className="text-xs text-slate-500">DL: {currentTenant.drugLicenseNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{currentTenant.name}</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {currentTenant.tagline} • Multi-tenant isolated workspace for catalog, pricing, and distribution rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('catalog')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-4 h-4" />
            Manage Catalog
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4" />
            Orders & Shipments ({ordersNeedingAction.length})
          </button>
        </div>
      </div>

      {/* Pending Return Action Alert (If any) */}
      {pendingReturnRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-900">
                  {pendingReturnRequests.length} Pending Return / Cancellation Request(s)
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-200 text-amber-900">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Distributor {pendingReturnRequests[0].distributorName} requested return for Order #{pendingReturnRequests[0].orderNumber}. Approving will automatically restock inventory to batch stock!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
          >
            Review in Returns Queue →
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Medicines</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeMedicinesCount}</div>
            <p className="text-xs text-slate-500 mt-0.5">{tenantMedicines.length} formulations total</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Low-Stock Batches</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{lowStockBatchesCount}</div>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">Batches ≤ 2,000 units</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Orders In Queue</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{ordersNeedingAction.length}</div>
            <p className="text-xs text-indigo-600 mt-0.5 font-medium">New / Confirmed / Ready</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Returns</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pendingReturnRequests.length}</div>
            <p className="text-xs text-rose-600 mt-0.5 font-medium">Awaiting QA inspection</p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Order Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(thisMonthOrderValue)}</div>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">Delivered & In-flight</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 mt-3 text-sm">Medicine Catalog & Batches</h3>
          <p className="text-xs text-slate-500 mt-1">
            Publish formulations, manage FEFO batches, expiry countdowns, and Schedule classifications.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('pricing')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 mt-3 text-sm">Pricing & Slab Engine</h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure standard prices vs MRP, distributor-specific price overrides, and quantity slabs.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('rules')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 mt-3 text-sm">Ordering Rules & Caps</h3>
          <p className="text-xs text-slate-500 mt-1">
            Enforce MOQ, step multiples (e.g. 10 strips), monthly distributor caps, and shortage behaviors.
          </p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
            <p className="text-xs text-slate-500">Live order queue for {currentTenant.shortName}</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View All ({tenantOrders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Distributor</th>
                <th className="py-3 px-4">Items / Formulations</th>
                <th className="py-3 px-4">Total (₹)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentOrders.map((order) => {
                const distributor = tenantDistributors.find((d) => d.id === order.distributorId);

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">
                        {distributor?.name || 'Authorized Buyer'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {distributor?.city}, {distributor?.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-800">{item.medicineName}</span>
                            <span className="text-slate-400">
                              ({item.fulfilledQuantity} {item.packagingUnit}s)
                            </span>
                            <span className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                              Batch {item.batchNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-slate-700">
                        {order.paymentMethod}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {order.paymentStatus === 'paid' ? 'Settled' : 'Net 30 Agreed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigateTab('orders')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
