import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { CartItem, Order } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { validateOrderQuantity } from '../../../engine/rulesEngine';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Truck,
  Building2,
  Package,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToOrders,
}) => {
  const {
    cart,
    currentDistributor,
    tenants,
    medicines,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutOrder,
  } = useStore();

  const [tenantPaymentMethods, setTenantPaymentMethods] = useState<Record<string, 'online' | 'credit'>>({});
  const [tenantFulfilmentMethods, setTenantFulfilmentMethods] = useState<
    Record<string, 'direct_shipping' | 'distributor_pickup' | 'logistics_partner'>
  >({});

  // Completed Order State for Confirmation Screen
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Group cart items by manufacturer (Section 3.4 requirement)
  const itemsByTenant = cart.reduce((acc, item) => {
    if (!acc[item.tenantId]) {
      acc[item.tenantId] = [];
    }
    acc[item.tenantId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const tenantIdsInCart = Object.keys(itemsByTenant);

  const handleCheckoutTenant = (tenantId: string) => {
    const tenantItems = itemsByTenant[tenantId];
    if (!tenantItems || tenantItems.length === 0) return;

    const tenant = tenants.find((t) => t.id === tenantId);
    const allowedTerms = tenant?.allowedPaymentTerms || ['online', 'credit'];
    const chosenPayment = tenantPaymentMethods[tenantId] || (allowedTerms.includes('credit') ? 'credit' : 'online');

    const allowedFulfilment = tenant?.allowedFulfilmentMethods || [
      'direct_shipping',
      'distributor_pickup',
      'logistics_partner',
    ];
    const chosenFulfilment =
      tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner';

    const order = checkoutOrder({
      tenantId,
      items: tenantItems,
      paymentMethod: chosenPayment,
      fulfilmentMethod: chosenFulfilment,
    });

    if (order) {
      setConfirmedOrder(order);
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white max-w-xl w-full h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Procurement Cart</h2>
              <p className="text-xs text-slate-500">
                {cart.length} item line(s) • Grouped by Manufacturer Principal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {confirmedOrder ? (
            /* IMMEDIATE ORDER CONFIRMATION SCREEN (Section 3.4 requirement) */
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Confirmed & Allocation Reserved
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  #{confirmedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Batch stock automatically deducted and distributor quota updated in real time.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Manufacturer Principal:</span>
                  <span className="text-slate-900 font-bold">
                    {tenants.find((t) => t.id === confirmedOrder.tenantId)?.name}
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {confirmedOrder.items.map((it, i) => (
                    <div key={i} className="py-2 flex justify-between">
                      <div>
                        <span className="font-semibold text-slate-900 block">{it.medicineName}</span>
                        <span className="text-[10px] text-slate-500">
                          Batch: {it.batchNumber} • Qty: {it.fulfilledQuantity} {it.packagingUnit}s
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-indigo-600">{formatCurrency(confirmedOrder.totalAmount)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-900">
                  <strong>Commercial Terms: </strong>
                  {confirmedOrder.paymentMethod === 'credit'
                    ? `Net 30 Credit Terms agreed. Invoice due on ${formatDate(confirmedOrder.creditDueDate)}.`
                    : 'Instant Online Payment Gateway verified.'}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                    if (onNavigateToOrders) onNavigateToOrders();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  View in My Orders →
                </button>
                <button
                  onClick={() => setConfirmedOrder(null)}
                  className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Continue Browsing Marketplace
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Browse medicines from authorized manufacturers and add quantities conforming to minimum order rules.
              </p>
            </div>
          ) : (
            /* Items Grouped by Manufacturer Principal (Section 3.4) */
            tenantIdsInCart.map((tenantId) => {
              const tenant = tenants.find((t) => t.id === tenantId);
              const items = itemsByTenant[tenantId];
              const tenantSubtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
              const tenantGst = Math.round(tenantSubtotal * 0.12);
              const tenantTotal = tenantSubtotal + tenantGst;

              // Check allowed payment terms for this tenant
              const allowedTerms = tenant?.allowedPaymentTerms || ['online', 'credit'];
              const allowedFulfilment = tenant?.allowedFulfilmentMethods || [
                'direct_shipping',
                'distributor_pickup',
                'logistics_partner',
              ];
              const relation = currentDistributor.authorizedTenants[tenantId];

              return (
                <div
                  key={tenantId}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4"
                >
                  {/* Tenant Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${tenant?.logoColor}`}></div>
                      <span className="font-bold text-slate-900 text-sm">{tenant?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      DL: {tenant?.drugLicenseNumber}
                    </span>
                  </div>

                  {/* Line Items */}
                  <div className="divide-y divide-slate-100">
                    {items.map((it) => {
                      const med = medicines.find((m) => m.id === it.medicineId);
                      const validation = med
                        ? validateOrderQuantity(currentDistributor, med, it.quantity)
                        : { isValid: true, errors: [] };

                      return (
                        <div key={`${it.medicineId}-${it.batchId}`} className="py-3 space-y-1.5 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900">{it.medicineName}</h4>
                              <p className="text-[11px] text-slate-500">
                                Batch <strong className="font-mono">{it.batchNumber}</strong> • Exp:{' '}
                                {formatDate(it.expiryDate)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(it.medicineId, it.batchId)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Qty:</span>
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val > 0) {
                                    updateCartQuantity(it.medicineId, it.batchId, val);
                                  }
                                }}
                                className="w-20 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                              />
                              <span className="text-slate-400">{it.packagingUnit}s</span>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-slate-900 text-sm">
                                {formatCurrency(it.unitPrice * it.quantity)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ({formatCurrency(it.unitPrice)} / unit)
                              </span>
                            </div>
                          </div>

                          {/* Stale/Checkout Validation Error Notice */}
                          {!validation.isValid && (
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5 mt-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{validation.errors[0]}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Options Permitted by this Manufacturer (Section 7) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Manufacturer Permitted Payment Terms
                    </span>

                    <div className="space-y-1.5">
                      {allowedTerms.includes('credit') && (
                        <label
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer ${
                            (tenantPaymentMethods[tenantId] || (allowedTerms.includes('credit') ? 'credit' : 'online')) === 'credit'
                              ? 'border-indigo-400 bg-white text-indigo-950 font-semibold'
                              : 'border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`payment-${tenantId}`}
                            checked={(tenantPaymentMethods[tenantId] || (allowedTerms.includes('credit') ? 'credit' : 'online')) === 'credit'}
                            onChange={() => setTenantPaymentMethods((prev) => ({ ...prev, [tenantId]: 'credit' }))}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div>
                            <span>Credit Terms (Net {relation?.assignedCreditDays || 30} Days)</span>
                            <span className="text-[10px] text-slate-500 block font-normal">
                              Agreed credit limit: {formatCurrency(relation?.creditLimit || 500000)}
                            </span>
                          </div>
                        </label>
                      )}

                      {allowedTerms.includes('online') && (
                        <label
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer ${
                            (tenantPaymentMethods[tenantId] || (allowedTerms.includes('credit') ? 'credit' : 'online')) === 'online'
                              ? 'border-indigo-400 bg-white text-indigo-950 font-semibold'
                              : 'border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`payment-${tenantId}`}
                            checked={(tenantPaymentMethods[tenantId] || (allowedTerms.includes('credit') ? 'credit' : 'online')) === 'online'}
                            onChange={() => setTenantPaymentMethods((prev) => ({ ...prev, [tenantId]: 'online' }))}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div>
                            <span>Online Payment Gateway (Mock Razorpay / UPI)</span>
                            <span className="text-[10px] text-slate-500 block font-normal">
                              Instant payment confirmation upon checkout
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Fulfilment & Delivery Options Permitted by Manufacturer (Requirement 8) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Manufacturer Fulfilment Method (Requirement 8)
                    </span>

                    <div className="space-y-1.5">
                      {allowedFulfilment.includes('logistics_partner') && (
                        <label
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            (tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'logistics_partner'
                              ? 'border-indigo-400 bg-white text-indigo-950 font-semibold'
                              : 'border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`fulfilment-${tenantId}`}
                            checked={(tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'logistics_partner'}
                            onChange={() => setTenantFulfilmentMethods((prev) => ({ ...prev, [tenantId]: 'logistics_partner' }))}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Manufacturer-Assigned Logistics Partner</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                              Dispatch via certified pharma 3PL (BlueDart HealthEx / Delhivery PharmaCold)
                            </span>
                          </div>
                        </label>
                      )}

                      {allowedFulfilment.includes('direct_shipping') && (
                        <label
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            (tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'direct_shipping'
                              ? 'border-indigo-400 bg-white text-indigo-950 font-semibold'
                              : 'border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`fulfilment-${tenantId}`}
                            checked={(tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'direct_shipping'}
                            onChange={() => setTenantFulfilmentMethods((prev) => ({ ...prev, [tenantId]: 'direct_shipping' }))}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-sky-600" />
                              <span>Manufacturer Direct Shipping</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                              Direct transport by {tenant?.shortName} temperature-controlled fleet
                            </span>
                          </div>
                        </label>
                      )}

                      {allowedFulfilment.includes('distributor_pickup') && (
                        <label
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            (tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'distributor_pickup'
                              ? 'border-indigo-400 bg-white text-indigo-950 font-semibold'
                              : 'border-slate-200 hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`fulfilment-${tenantId}`}
                            checked={(tenantFulfilmentMethods[tenantId] || allowedFulfilment[0] || 'logistics_partner') === 'distributor_pickup'}
                            onChange={() => setTenantFulfilmentMethods((prev) => ({ ...prev, [tenantId]: 'distributor_pickup' }))}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-amber-600" />
                              <span>Distributor-Arranged Self Pickup</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                              Self-arranged collection from central warehouse (Form 20B wholesale authorization required)
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Subtotal & Checkout Button for this Tenant */}
                  <div className="pt-2 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(tenantSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (12% Pharma):</span>
                      <span className="font-semibold">{formatCurrency(tenantGst)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Invoice:</span>
                      <span className="text-base text-indigo-700 font-extrabold">
                        {formatCurrency(tenantTotal)}
                      </span>
                    </div>

                    {(() => {
                      const hasErrors = items.some((item) => {
                        const med = medicines.find((m) => m.id === item.medicineId);
                        return med ? !validateOrderQuantity(currentDistributor, med, item.quantity).isValid : false;
                      });

                      return (
                        <button
                          onClick={() => handleCheckoutTenant(tenantId)}
                          disabled={hasErrors}
                          className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 ${
                            hasErrors
                              ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Place Requisition to {tenant?.shortName}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
