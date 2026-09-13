import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Distributor, DistributorApprovalStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import {
  ShieldCheck,
  FileText,
  CheckCircle,
} from 'lucide-react';

export const DistributorManagementScreen: React.FC = () => {
  const {
    currentTenant,
    distributors,
    tenantOrders,
    approveDistributor,
    rejectDistributor,
    suspendDistributor,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  // Action Modals State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'suspend';
    distributor: Distributor | null;
  }>({
    isOpen: false,
    type: 'approve',
    distributor: null,
  });

  // Filter distributors for this manufacturer
  const tenantDistributorsList = distributors.filter((d) => {
    const relation = d.authorizedTenants[currentTenant.id];
    const status = relation?.status || 'pending';

    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleActionConfirm = (reason?: string) => {
    if (!actionModal.distributor) return;
    const distId = actionModal.distributor.id;

    if (actionModal.type === 'approve') {
      approveDistributor(distId, currentTenant.id, 30, 500000);
    } else if (actionModal.type === 'reject') {
      rejectDistributor(distId, currentTenant.id, reason || 'Compliance check failed');
    } else if (actionModal.type === 'suspend') {
      suspendDistributor(distId, currentTenant.id, reason || 'Commercial default or expired license');
    }

    setActionModal({ isOpen: false, type: 'approve', distributor: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Distributor Network & Compliance</h1>
          <p className="text-xs text-slate-500">
            Authorize wholesale partners, verify Form 20B/21B drug licenses, set credit lines and quotas for {currentTenant.shortName}.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search distributor by firm name, GSTIN, city..."
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Partners' },
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distributors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Distributor Firm</th>
                <th className="py-3.5 px-4">Wholesale Drug Licenses</th>
                <th className="py-3.5 px-4">Commercial Terms</th>
                <th className="py-3.5 px-4">Monthly Quota</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tenantDistributorsList.map((dist) => {
                const relation = dist.authorizedTenants[currentTenant.id];
                const status: DistributorApprovalStatus = relation?.status || 'pending';
                const limit = relation?.monthlyQuantityLimit ?? (relation?.status === 'rejected' ? 0 : 2000);
                const used = relation?.monthlyQuantityUsed || 0;
                const remaining = Math.max(0, limit - used);

                return (
                  <tr key={dist.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{dist.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {dist.contactPerson} • {dist.phone}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dist.city}, {dist.state} • GST: {dist.gstin}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-[11px] font-semibold text-slate-800">
                        20B: {dist.licenses.form20B}
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-slate-800">
                        21B: {dist.licenses.form21B}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Valid to {formatDate(dist.licenses.validTo)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">
                        {relation ? `Net ${relation.assignedCreditDays} Days` : 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Limit: {formatCurrency(relation?.creditLimit || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Used: {formatCurrency(relation?.creditUsed || 0)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">
                        {used.toLocaleString()} / {limit.toLocaleString()} units
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{
                            width: `${limit > 0 ? Math.min(100, (used / limit) * 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {remaining.toLocaleString()} remaining
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={status} size="sm" />
                      {relation?.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 max-w-[150px]">
                          {relation.rejectionReason}
                        </p>
                      )}
                      {relation?.suspensionReason && (
                        <p className="text-[10px] text-amber-700 mt-1 max-w-[150px]">
                          {relation.suspensionReason}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDistributor(dist)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          View Profile
                        </button>

                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                setActionModal({
                                  isOpen: true,
                                  type: 'approve',
                                  distributor: dist,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  isOpen: true,
                                  type: 'reject',
                                  distributor: dist,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {status === 'approved' && (
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: 'suspend',
                                distributor: dist,
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700"
                          >
                            Suspend
                          </button>
                        )}

                        {status === 'suspended' && (
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: 'approve',
                                distributor: dist,
                              })
                            }
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Re-activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISTRIBUTOR PROFILE & COMPLIANCE INSPECTOR MODAL (Section 8) */}
      {selectedDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  Distributor Compliance Profile
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedDistributor.name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedDistributor.address}, {selectedDistributor.city}, {selectedDistributor.state} - {selectedDistributor.pincode}
                </p>
              </div>
              <button
                onClick={() => setSelectedDistributor(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Regulatory Checklist (Section 8 access control checklist) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Purchase Eligibility & Regulatory Checklist
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Form 20B Wholesale</span>
                    <span className="text-[10px] text-slate-500">
                      {selectedDistributor.licenses.form20B}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Form 21B Wholesale</span>
                    <span className="text-[10px] text-slate-500">
                      {selectedDistributor.licenses.form21B}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">GSTIN Validated</span>
                    <span className="text-[10px] text-slate-500">{selectedDistributor.gstin}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Regulatory Expiry Check</span>
                    <span className="text-[10px] text-slate-500">
                      Valid through {formatDate(selectedDistributor.licenses.validTo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* License Document Placeholder */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">
                  {selectedDistributor.licenses.documentPlaceholderUrl || 'dl-license-affidavit.pdf'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-sky-600 cursor-pointer hover:underline">
                View Scanned Copy ↗
              </span>
            </div>

            {/* Order History with this tenant */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Transaction History with {currentTenant.shortName}
              </h4>
              {tenantOrders.filter((o) => o.distributorId === selectedDistributor.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No purchase orders placed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-40 overflow-y-auto text-xs">
                  {tenantOrders
                    .filter((o) => o.distributorId === selectedDistributor.id)
                    .map((o) => (
                      <div key={o.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{o.orderNumber}</span>
                          <span className="text-slate-400 block text-[10px]">
                            {formatDate(o.createdAt)} • {o.items.length} item(s)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{formatCurrency(o.totalAmount)}</span>
                          <span className="block text-[10px] uppercase font-semibold text-slate-500">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDistributor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (APPROVE / REJECT / SUSPEND WITH REASON CAPTURE) */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        title={
          actionModal.type === 'approve'
            ? `Approve ${actionModal.distributor?.name}?`
            : actionModal.type === 'reject'
            ? `Reject Access for ${actionModal.distributor?.name}?`
            : `Suspend ${actionModal.distributor?.name}?`
        }
        description={
          actionModal.type === 'approve'
            ? 'Approving will grant this distributor full access to browse your medicines, receive wholesale pricing, and place purchase requisitions.'
            : actionModal.type === 'reject'
            ? 'Rejecting will deny marketplace catalog access and forbid ordering. A mandatory reason must be provided.'
            : 'Suspension immediately locks order placement for this distributor.'
        }
        confirmLabel={
          actionModal.type === 'approve'
            ? 'Authorize & Grant Access'
            : actionModal.type === 'reject'
            ? 'Confirm Rejection'
            : 'Suspend Account'
        }
        variant={actionModal.type === 'approve' ? 'success' : actionModal.type === 'reject' ? 'danger' : 'warning'}
        requireReason={actionModal.type !== 'approve'}
        reasonPlaceholder={
          actionModal.type === 'reject'
            ? 'e.g. Expired Form 20B license, incomplete bank mandate...'
            : 'e.g. Outstanding 90-day payments overdue...'
        }
        onConfirm={handleActionConfirm}
        onCancel={() => setActionModal({ isOpen: false, type: 'approve', distributor: null })}
      />
    </div>
  );
};
