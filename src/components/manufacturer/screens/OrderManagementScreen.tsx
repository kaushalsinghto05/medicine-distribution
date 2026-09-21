import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Order, OrderStatus, ReturnRequest, LogisticsPartner } from '../../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { OrderLifecycleStepper } from '../../ui/OrderLifecycleStepper';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import {
  Truck,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export const OrderManagementScreen: React.FC = () => {
  const {
    currentTenant,
    tenantOrders,
    tenantReturnRequests,
    tenantDistributors,
    tenantLogisticsPartners,
    updateOrderStatus,
    approveReturnRequest,
    rejectReturnRequest,
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalTab, setOrderModalTab] = useState<'details' | 'timeline' | 'audit'>('details');

  // Sync selectedOrder if tenantOrders changes
  useEffect(() => {
    if (selectedOrder) {
      const fresh = tenantOrders.find((o) => o.id === selectedOrder.id);
      if (fresh) setSelectedOrder(fresh);
    }
  }, [tenantOrders]);

  // Dispatch Modal State
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [selectedLogisticsId, setSelectedLogisticsId] = useState<string>(
    tenantLogisticsPartners[0]?.id || ''
  );
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>(
    'BD-HE-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN'
  );

  const openDispatchModal = (order: Order) => {
    setDispatchModalOrder(order);
    setTrackingNumberInput('BD-HE-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN');
    if (tenantLogisticsPartners.length > 0) {
      setSelectedLogisticsId(tenantLogisticsPartners[0].id);
    }
  };

  // Return Decision Modal State
  const [returnDecisionModal, setReturnDecisionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    request: ReturnRequest | null;
  }>({
    isOpen: false,
    type: 'approve',
    request: null,
  });

  // Filter Orders
  const filteredOrders = tenantOrders.filter((ord) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'returns_queue') return false; // Handled separately
    return ord.status === activeTab;
  });

  const pendingReturns = tenantReturnRequests.filter((r) => r.status === 'pending');

  const handleDispatchConfirm = () => {
    if (!dispatchModalOrder) return;
    const partner = tenantLogisticsPartners.find((p) => p.id === selectedLogisticsId);

    updateOrderStatus(
      dispatchModalOrder.id,
      'dispatched',
      `Shipment handed over to ${partner?.name || 'Carrier'}. Waybill #${trackingNumberInput}`,
      {
        partnerId: selectedLogisticsId,
        trackingRef: trackingNumberInput,
      }
    );

    // Refresh selectedOrder if open
    if (selectedOrder && selectedOrder.id === dispatchModalOrder.id) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'dispatched',
              logisticsPartnerName: partner?.name,
              trackingReference: trackingNumberInput,
            }
          : null
      );
    }

    setDispatchModalOrder(null);
  };

  const handleReturnDecisionConfirm = (reason?: string) => {
    if (!returnDecisionModal.request) return;
    const req = returnDecisionModal.request;

    if (returnDecisionModal.type === 'approve') {
      approveReturnRequest(req.id, reason || 'Return inspection passed. Stock credited.');
    } else {
      rejectReturnRequest(req.id, reason || 'Physical quality standards not met.');
    }

    setReturnDecisionModal({ isOpen: false, type: 'approve', request: null });
  };

  const advanceOrderStatus = (order: Order) => {
    const sequence: Record<OrderStatus, OrderStatus | null> = {
      new: 'confirmed',
      confirmed: 'processing',
      processing: 'ready_for_dispatch',
      ready_for_dispatch: 'dispatched', // Opens dispatch modal!
      dispatched: 'delivered',
      delivered: null,
      cancelled: null,
      returned: null,
    };

    const next = sequence[order.status];
    if (!next) return;

    if (next === 'dispatched') {
      openDispatchModal(order);
      return;
    }

    updateOrderStatus(order.id, next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-slate-900">Order Fulfilment & Returns</h1>
          <p className="text-xs text-slate-500">
            Manage 8-stage lifecycle progression, carrier dispatch, tracking references, and return restock authorizations.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-none flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'All Orders', count: tenantOrders.length },
          { id: 'new', label: 'New', count: tenantOrders.filter((o) => o.status === 'new').length },
          {
            id: 'confirmed',
            label: 'Confirmed',
            count: tenantOrders.filter((o) => o.status === 'confirmed').length,
          },
          {
            id: 'processing',
            label: 'Processing',
            count: tenantOrders.filter((o) => o.status === 'processing').length,
          },
          {
            id: 'ready_for_dispatch',
            label: 'Ready to Dispatch',
            count: tenantOrders.filter((o) => o.status === 'ready_for_dispatch').length,
          },
          {
            id: 'dispatched',
            label: 'Dispatched',
            count: tenantOrders.filter((o) => o.status === 'dispatched').length,
          },
          {
            id: 'delivered',
            label: 'Delivered',
            count: tenantOrders.filter((o) => o.status === 'delivered').length,
          },
          {
            id: 'cancelled',
            label: 'Cancelled',
            count: tenantOrders.filter((o) => o.status === 'cancelled').length,
          },
          {
            id: 'returned',
            label: 'Returned',
            count: tenantOrders.filter((o) => o.status === 'returned').length,
          },
          {
            id: 'returns_queue',
            label: 'Returns Queue',
            count: pendingReturns.length,
            highlight: pendingReturns.length > 0,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-none'
                : tab.highlight
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-sky-700 text-white'
                  : tab.highlight
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SPECIAL VIEW: RETURNS & CANCELLATIONS QUEUE (Section 2.6, 6) */}
      {activeTab === 'returns_queue' ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-none overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">Returns & Cancellations Inbox</h3>
              <p className="text-xs text-slate-500">
                Incoming distributor claims. Approving a claim immediately updates inventory back into active batch stock and writes an audit log.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
              {pendingReturns.length} Action Pending
            </span>
          </div>

          {tenantReturnRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No return or cancellation requests on record.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tenantReturnRequests.map((req) => (
                <div key={req.id} className="p-5 space-y-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{req.id}</span>
                      <span className="text-xs text-slate-500">• Order #{req.orderNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.type === 'cancellation'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {req.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(req.createdAt)}</span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column: Claim Details (2 Cols) */}
                    <div className="lg:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Distributor: {req.distributorName}
                        </span>
                        <span className="text-slate-500 tabular-nums">
                          Total Claimed:{' '}
                          <strong className="text-slate-900 font-extrabold">
                            {req.items.reduce((s, i) => s + i.quantity, 0)} units
                          </strong>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reason & Note:</span>
                        <span className="text-slate-800 font-medium italic mt-0.5 block">"{req.distributorNote}"</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-500 block">
                          Affected Batch Line Items
                        </span>
                        {req.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-700 p-2 rounded-lg bg-white border border-slate-200/60 tabular-nums">
                            <span>
                              {it.medicineName} (Batch <strong>{it.batchNumber}</strong>)
                            </span>
                            <span className="font-bold text-indigo-700">
                              {it.quantity} {it.packagingUnit}s
                            </span>
                          </div>
                        ))}
                      </div>

                      {req.manufacturerResponseNote && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                          <strong>Manufacturer Resolution:</strong> {req.manufacturerResponseNote}
                        </div>
                      )}
                    </div>

                    {/* Right Column: QA Decision & Restock Panel */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs flex flex-col justify-between space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">Restock Audit Preview</span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Approval atomically increments the manufacturer batch inventory by claimed units and writes an immutable audit ledger entry.
                        </p>
                      </div>

                      {req.status === 'pending' ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() =>
                              setReturnDecisionModal({
                                isOpen: true,
                                type: 'approve',
                                request: req,
                              })
                            }
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            ✓ Approve & Restock Batch
                          </button>
                          <button
                            onClick={() =>
                              setReturnDecisionModal({
                                isOpen: true,
                                type: 'reject',
                                request: req,
                              })
                            }
                            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 font-bold text-xs transition-colors"
                          >
                            ✕ Reject Return Claim
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 font-semibold text-[11px]">
                          Claim evaluation complete
                        </div>
                      )}
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() =>
                          setReturnDecisionModal({
                            isOpen: true,
                            type: 'reject',
                            request: req,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() =>
                          setReturnDecisionModal({
                            isOpen: true,
                            type: 'approve',
                            request: req,
                          })
                        }
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve & Auto-Restock Inventory
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD ORDERS TABLE */
        <div className="bg-white rounded-lg border border-slate-200 shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Distributor</th>
                  <th className="py-3.5 px-4">Items & Batches</th>
                  <th className="py-3.5 px-4">Total (₹)</th>
                  <th className="py-3.5 px-4">Logistics / Tracking</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No orders in this status category.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const dist = tenantDistributors.find((d) => d.id === ord.distributorId);

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {ord.orderNumber}
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {formatDate(ord.createdAt)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-900 block">{dist?.name}</span>
                          <span className="text-[10px] text-slate-500">{dist?.city}, {dist?.state}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-800">{it.medicineName}</span>
                                <span className="text-slate-400">({it.fulfilledQuantity} {it.packagingUnit}s)</span>
                                <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                                  {it.batchNumber}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{formatCurrency(ord.totalAmount)}</div>
                          <span className="text-[10px] text-slate-500 capitalize">
                            {ord.paymentMethod} • {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {ord.trackingReference ? (
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {ord.logisticsPartnerName || 'Logistics Partner'}
                              </span>
                              <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                {ord.trackingReference}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <StatusBadge status={ord.status} size="sm" />
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setOrderModalTab('details');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                              Inspect
                            </button>

                            {ord.status === 'new' && (
                              <button
                                onClick={() => advanceOrderStatus(ord)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                              >
                                Confirm Order
                              </button>
                            )}

                            {ord.status === 'confirmed' && (
                              <button
                                onClick={() => advanceOrderStatus(ord)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                              >
                                Process in WH
                              </button>
                            )}

                            {ord.status === 'processing' && (
                              <button
                                onClick={() => advanceOrderStatus(ord)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                              >
                                Mark Ready
                              </button>
                            )}

                            {ord.status === 'ready_for_dispatch' && (
                              <button
                                onClick={() => advanceOrderStatus(ord)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Dispatch Shipment
                              </button>
                            )}

                            {ord.status === 'dispatched' && (
                              <button
                                onClick={() => advanceOrderStatus(ord)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPATCH DETAILS MODAL (Section 2.6) */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Dispatch Order {dispatchModalOrder.orderNumber}</h2>
            <p className="text-xs text-slate-500">
              Assign logistics carrier and waybill tracking reference for shipment tracking.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Logistics Carrier Partner
                </label>
                <select
                  value={selectedLogisticsId}
                  onChange={(e) => setSelectedLogisticsId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {tenantLogisticsPartners.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.name} ({lp.coverageArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Air Waybill / Consignment Tracking No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ORDER INSPECTION MODAL WITH AUDIT TRAIL (Section 2.6 & 9) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedOrder.orderNumber}</h2>
                  <StatusBadge status={selectedOrder.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {formatDateTime(selectedOrder.createdAt)} by{' '}
                  <span className="font-semibold text-slate-800">
                    {tenantDistributors.find((d) => d.id === selectedOrder.distributorId)?.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Reusable Order Lifecycle Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Order Fulfilment Progression
              </span>
              <OrderLifecycleStepper currentStatus={selectedOrder.status} orderDate={selectedOrder.createdAt} />
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
              <button
                onClick={() => setOrderModalTab('details')}
                className={`px-3 py-1.5 font-semibold rounded-lg ${
                  orderModalTab === 'details'
                    ? 'bg-sky-100 text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Order Summary & Items
              </button>
              <button
                onClick={() => setOrderModalTab('timeline')}
                className={`px-3 py-1.5 font-semibold rounded-lg ${
                  orderModalTab === 'timeline'
                    ? 'bg-sky-100 text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Status Stepper & Timeline
              </button>
              <button
                onClick={() => setOrderModalTab('audit')}
                className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1 ${
                  orderModalTab === 'audit'
                    ? 'bg-sky-100 text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit Trail & Compliance Log
              </button>
            </div>

            {/* Tab 1: Details */}
            {orderModalTab === 'details' && (
              <div className="space-y-4 text-xs">
                {/* Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Item / Formulation</th>
                        <th className="py-2 px-3">Allocated Batch</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3">Unit MRP</th>
                        <th className="py-2 px-3">Distributor Price</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {it.medicineName}
                            <span className="text-[10px] text-slate-400 block">{it.genericName}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {it.batchNumber}
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Exp: {formatDate(it.expiryDate)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {it.fulfilledQuantity} {it.packagingUnit}s
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{formatCurrency(it.unitMrp)}</td>
                          <td className="py-2.5 px-3 font-bold text-sky-700">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(it.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Breakdown */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (12% Pharma):</span>
                    <span className="font-semibold">{formatCurrency(selectedOrder.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                    <span className="font-bold text-slate-900">Total Invoice Amount:</span>
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Shipping & Payment Meta */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Payment Policy
                    </span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                    </span>
                    {selectedOrder.creditDueDate && (
                      <span className="text-[10px] text-slate-500 block">
                        Credit Due: {formatDate(selectedOrder.creditDueDate)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Shipment / Carrier
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedOrder.logisticsPartnerName || 'Pending Carrier Assignment'}
                    </span>
                    {selectedOrder.trackingReference && (
                      <span className="font-mono text-[10px] text-sky-700 block">
                        Ref: {selectedOrder.trackingReference}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Timeline Stepper */}
            {orderModalTab === 'timeline' && (
              <div className="py-4 space-y-4">
                <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
                  {selectedOrder.statusHistory.map((sh, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full bg-sky-600 border-2 border-white"></span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sh.status} size="sm" />
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(sh.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 mt-1">{sh.note}</p>
                      <span className="text-[10px] text-slate-400">By: {sh.updatedBy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Immutable Audit Trail (Section 9) */}
            {orderModalTab === 'audit' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Immutable transaction log adhering to Indian Drug Regulatory Schedule & Track-and-Trace guidelines.
                </p>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  {selectedOrder.auditTrail.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-50/60">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-700 text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 mt-0.5">{log.details}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Actor: {log.actor}</span>
                        {log.quantityDelta != null && log.quantityDelta !== 0 && (
                          <span
                            className={`font-semibold ${
                              log.quantityDelta < 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            Stock Delta: {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Rule Policy: {selectedOrder.appliedRuleSummary}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN DECISION CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={returnDecisionModal.isOpen}
        title={
          returnDecisionModal.type === 'approve'
            ? `Approve & Restock Return ${returnDecisionModal.request?.id}?`
            : `Reject Return Claim ${returnDecisionModal.request?.id}?`
        }
        description={
          returnDecisionModal.type === 'approve'
            ? 'Approving will immediately and atomically credit the returned medicine quantity back to the active production batch stock, reduce distributor quota usage, and record an immutable restock audit log.'
            : 'Rejecting denies inventory credit. The distributor will be notified with your recorded reason.'
        }
        confirmLabel={
          returnDecisionModal.type === 'approve'
            ? 'Approve & Restock Batch Inventory'
            : 'Confirm Rejection'
        }
        variant={returnDecisionModal.type === 'approve' ? 'success' : 'danger'}
        requireReason={returnDecisionModal.type === 'reject'}
        reasonPlaceholder="Specify inspection or regulatory failure reason..."
        onConfirm={handleReturnDecisionConfirm}
        onCancel={() => setReturnDecisionModal({ isOpen: false, type: 'approve', request: null })}
      />
    </div>
  );
};
