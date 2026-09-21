import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Order } from '../../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { OrderLifecycleStepper } from '../../ui/OrderLifecycleStepper';
import { EmptyState } from '../../ui/EmptyState';
import { Button } from '../../ui/Button';
import { PackageCheck, RotateCcw, ChevronDown, ChevronUp, Clock, Truck, ShieldAlert } from 'lucide-react';

export const OrderHistoryScreen: React.FC = () => {
  const {
    distributorOrders,
    tenants,
    distributorReturnRequests,
    createReturnRequest,
    addToast,
  } = useStore();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Return Modal State
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
        <h1 className="font-heading font-bold text-xl text-slate-900">Purchase Orders & Shipments</h1>
        <p className="text-xs text-slate-500">
          Track lifecycle stages, freight carrier tracking numbers, and initiate return or cancellation requests.
        </p>
      </div>

      {distributorOrders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No Orders Placed Yet"
          description="You have not created any purchase orders. Browse authorized medicines and checkout to track order fulfilment here."
        />
      ) : (
        <div className="space-y-3">
          {distributorOrders.map((ord) => {
            const tenant = tenants.find((t) => t.id === ord.tenantId);
            const isExpanded = expandedOrderId === ord.id;
            const canCancel = ord.status === 'new' || ord.status === 'confirmed';
            const canReturn = ord.status === 'delivered';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-lg border border-slate-200 shadow-none overflow-hidden transition-all duration-150"
              >
                {/* Order Row Header */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PackageCheck className="w-5 h-5 text-[#1A504C] shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{ord.id}</span>
                        <StatusBadge status={ord.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tenant?.name} • {formatDate(ord.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Grand Total</span>
                      <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                    </div>

                    <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Order Lifecycle Stepper & Items */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fade-slide">
                    {/* Unified Order Lifecycle Stepper */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-none">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Fulfilment Lifecycle
                      </span>
                      <OrderLifecycleStepper currentStatus={ord.status} orderDate={ord.createdAt} />
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 font-bold text-xs text-slate-700">
                        Order Line Items ({ord.items.length})
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 block">{it.medicineName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Lot: {it.batchNumber} • Exp: {formatDate(it.expiryDate)}
                              </span>
                            </div>
                            <div className="text-right tabular-nums">
                              <span className="font-bold text-slate-900">
                                {it.fulfilledQuantity} {it.packagingUnit}s
                              </span>
                              <span className="text-slate-500 block text-[11px]">
                                @ {formatCurrency(it.unitPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex items-center gap-2 justify-end pt-2">
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenReturnModal(ord, 'cancellation')}
                        >
                          Request Cancellation
                        </Button>
                      )}
                      {canReturn && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReturnModal(ord, 'return')}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          Initiate Return Claim
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
