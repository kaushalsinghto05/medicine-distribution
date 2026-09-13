import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Order } from '../../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { PackageCheck, RotateCcw } from 'lucide-react';

export const OrderHistoryScreen: React.FC = () => {
  const {
    distributorOrders,
    tenants,
    distributorReturnRequests,
    createReturnRequest,
    addToast,
  } = useStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Return / Cancellation Request Modal State
  const [returnModal, setReturnModal] = useState<{
    isOpen: boolean;
    order: Order | null;
    type: 'cancellation' | 'return';
    selectedBatchId: string;
    quantity: number;
    reason: string;
  }>({
    isOpen: false,
    order: null,
    type: 'return',
    selectedBatchId: '',
    quantity: 10,
    reason: '',
  });

  const handleOpenReturnModal = (order: Order, type: 'cancellation' | 'return') => {
    setReturnModal({
      isOpen: true,
      order,
      type,
      selectedBatchId: order.items[0]?.batchId || '',
      quantity: order.items[0]?.fulfilledQuantity || 10,
      reason: '',
    });
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModal.order || !returnModal.reason.trim()) {
      addToast('error', 'Reason Required', 'Please provide a detailed reason for the request.');
      return;
    }

    const selectedItem = returnModal.order.items.find(
      (it) => it.batchId === returnModal.selectedBatchId
    ) || returnModal.order.items[0];

    if (!selectedItem) return;

    if (returnModal.quantity <= 0 || returnModal.quantity > selectedItem.fulfilledQuantity) {
      addToast(
        'error',
        'Invalid Quantity',
        `Quantity must be between 1 and the fulfilled quantity (${selectedItem.fulfilledQuantity}).`
      );
      return;
    }

    createReturnRequest(
      returnModal.order.id,
      returnModal.type,
      [
        {
          medicineId: selectedItem.medicineId,
          batchId: selectedItem.batchId,
          quantity: returnModal.quantity,
          reason: returnModal.reason,
        },
      ],
      returnModal.reason
    );

    setReturnModal({
      isOpen: false,
      order: null,
      type: 'return',
      selectedBatchId: '',
      quantity: 10,
      reason: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Purchase Orders & Shipments</h1>
        <p className="text-xs text-slate-500">
          Track lifecycle stages, freight carrier tracking numbers, and initiate return or cancellation requests.
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {distributorOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Orders Placed Yet</p>
            <p className="text-xs text-slate-400">
              Browse the catalog to create wholesale requisitions with your authorized manufacturers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Manufacturer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Invoice Total</th>
                  <th className="py-3.5 px-4">Tracking</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {distributorOrders.map((ord) => {
                  const tenant = tenants.find((t) => t.id === ord.tenantId);

                  // Eligibility for cancellation or return
                  const canCancel = ['new', 'confirmed'].includes(ord.status);
                  const canReturn = ord.status === 'delivered';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {ord.orderNumber}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {tenant?.shortName || ord.tenantId}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {ord.paymentMethod} • {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-800">{it.medicineName}</span>
                              <span className="text-slate-400">
                                ({it.fulfilledQuantity} {it.packagingUnit}s)
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount)}
                      </td>

                      <td className="py-4 px-4">
                        {ord.trackingReference ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {ord.logisticsPartnerName || 'Carrier'}
                            </span>
                            <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                              {ord.trackingReference}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Processing</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            Details
                          </button>

                          {canCancel && (
                            <button
                              onClick={() => handleOpenReturnModal(ord, 'cancellation')}
                              className="px-2 py-1 text-[11px] font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                            >
                              Cancel
                            </button>
                          )}

                          {canReturn && (
                            <button
                              onClick={() => handleOpenReturnModal(ord, 'return')}
                              className="px-2 py-1 text-[11px] font-semibold rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Return
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
        )}
      </div>

      {/* Return Requests & Claims Section */}
      {distributorReturnRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Claims & Return Requisitions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Medicine & Qty</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Manufacturer QA Response</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {distributorReturnRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{req.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{req.orderNumber}</td>
                    <td className="py-3 px-3 capitalize">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {req.items.map((it, idx) => (
                        <div key={idx}>
                          <span className="font-semibold">{it.medicineName}</span>{' '}
                          <span className="text-slate-500">
                            ({it.quantity} {it.packagingUnit}s, Batch {it.batchNumber})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-600 truncate" title={req.distributorNote}>
                      {req.distributorNote}
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-600">
                      {req.manufacturerResponseNote || (
                        <span className="italic text-slate-400">Under QA evaluation</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAIL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <StatusBadge status={selectedOrder.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {formatDateTime(selectedOrder.createdAt)} with{' '}
                  <strong className="text-slate-800">
                    {tenants.find((t) => t.id === selectedOrder.tenantId)?.name}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Formulation</th>
                    <th className="py-2.5 px-3">Batch Ref</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-3 px-3 font-semibold text-slate-900">{it.medicineName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{it.batchNumber}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {it.fulfilledQuantity} {it.packagingUnit}s
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tracking Reference (If Dispatched) */}
            {selectedOrder.trackingReference && (
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Shipment Logistics
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedOrder.logisticsPartnerName}
                  </span>
                  <span className="font-mono text-xs text-sky-700 block mt-0.5">
                    Waybill: {selectedOrder.trackingReference}
                  </span>
                </div>
                <span className="px-3 py-1.5 bg-sky-600 text-white rounded-xl font-bold text-xs shadow-xs">
                  In Transit
                </span>
              </div>
            )}

            {/* Stepper Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Lifecycle Progression History
              </span>
              <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs">
                {selectedOrder.statusHistory.map((sh, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white"></span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase text-[11px]">
                        {sh.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(sh.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{sh.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN / CANCELLATION REQUEST MODAL */}
      {returnModal.isOpen && returnModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              Initiate {returnModal.type} Request
            </h2>
            <p className="text-xs text-slate-500">
              For Order #{returnModal.order.orderNumber}. This will be reviewed by the manufacturer QA cell before stock is restocked.
            </p>

            <form onSubmit={handleSubmitReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Line Item</label>
                <select
                  value={returnModal.selectedBatchId}
                  onChange={(e) => {
                    const chosenBatch = returnModal.order?.items.find((it) => it.batchId === e.target.value);
                    setReturnModal({
                      ...returnModal,
                      selectedBatchId: e.target.value,
                      quantity: chosenBatch?.fulfilledQuantity || 1,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {returnModal.order.items.map((it) => (
                    <option key={it.batchId} value={it.batchId}>
                      {it.medicineName} (Batch {it.batchNumber}) — {it.fulfilledQuantity} {it.packagingUnit}s
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to {returnModal.type === 'cancellation' ? 'Cancel' : 'Return'} (Max:{' '}
                  {returnModal.order.items.find((it) => it.batchId === returnModal.selectedBatchId)?.fulfilledQuantity || 1}
                  )
                </label>
                <input
                  type="number"
                  min="1"
                  max={returnModal.order.items.find((it) => it.batchId === returnModal.selectedBatchId)?.fulfilledQuantity || 1}
                  required
                  value={returnModal.quantity}
                  onChange={(e) => setReturnModal({ ...returnModal, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Claim <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnModal.reason}
                  onChange={(e) => setReturnModal({ ...returnModal, reason: e.target.value })}
                  placeholder="e.g. Outer shipper damage in transit, order duplicated by procurement desk..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnModal({ ...returnModal, isOpen: false, order: null })}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
