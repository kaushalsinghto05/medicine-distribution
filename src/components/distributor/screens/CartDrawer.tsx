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
  CreditCard,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../ui/Button';

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

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'confirmation'>('cart');
  const [tenantPaymentMethods, setTenantPaymentMethods] = useState<Record<string, 'online' | 'credit'>>({});
  const [tenantFulfilmentMethods, setTenantFulfilmentMethods] = useState<
    Record<string, 'direct_shipping' | 'distributor_pickup' | 'logistics_partner'>
  >({});

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Group cart items by manufacturer
  const itemsByTenant = cart.reduce((acc, item) => {
    if (!acc[item.tenantId]) {
      acc[item.tenantId] = [];
    }
    acc[item.tenantId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const tenantIdsInCart = Object.keys(itemsByTenant);
  const grandTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

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
      setCheckoutStep('confirmation');
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white max-w-xl w-full h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Step Indicator Header */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Procurement Cart</h2>
                <p className="text-xs text-slate-500 tabular-nums">
                  {cart.length} SKU line(s) • Grouped by Manufacturer Principal
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

          {/* Checkout Steps (Cart -> Payment -> Confirmation) */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <div className={`flex items-center gap-1.5 font-bold ${checkoutStep === 'cart' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 'cart' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>1</span>
              <span>Review Cart</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className="flex items-center gap-1.5 font-semibold text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</span>
              <span>Payment Terms</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className={`flex items-center gap-1.5 font-bold ${checkoutStep === 'confirmation' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {confirmedOrder ? (
            /* Calm Enterprise Order Confirmation Screen */
            <div className="text-center py-8 px-4 space-y-5 animate-fade-slide">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Confirmed & Allocation Reserved
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  #{confirmedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Batch stock automatically deducted and distributor quota updated in real time.
                </p>
              </div>

              {/* Order Summary Card */}
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
                        <span className="text-[10px] text-slate-500 tabular-nums">
                          Batch: {it.batchNumber} • Qty: {it.fulfilledQuantity} {it.packagingUnit}s
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-indigo-600 tabular-nums">{formatCurrency(confirmedOrder.totalAmount)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-900">
                  <strong>Commercial Terms: </strong>
                  {confirmedOrder.paymentMethod === 'credit'
                    ? `Net 30 Credit Terms agreed. Invoice due on ${formatDate(confirmedOrder.creditDueDate)}.`
                    : 'Instant Online Payment Gateway verified.'}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setConfirmedOrder(null);
                    setCheckoutStep('cart');
                    onClose();
                    if (onNavigateToOrders) onNavigateToOrders();
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View in My Orders
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmedOrder(null);
                    setCheckoutStep('cart');
                  }}
                >
                  Continue Procurement
                </Button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ShoppingCart className="w-12 h-12 stroke-[1.5] text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Your Procurement Cart is Empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore medicines from your authorized manufacturers to create purchase orders.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tenantIdsInCart.map((tenantId) => {
                const tenant = tenants.find((t) => t.id === tenantId);
                const items = itemsByTenant[tenantId];
                const tenantSubtotal = items.reduce(
                  (sum, item) => sum + item.unitPrice * item.quantity,
                  0
                );

                const allowedPayment = tenant?.allowedPaymentTerms || ['online', 'credit'];
                const currentPayment =
                  tenantPaymentMethods[tenantId] ||
                  (allowedPayment.includes('credit') ? 'credit' : 'online');

                return (
                  <div
                    key={tenantId}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 shadow-2xs"
                  >
                    {/* Manufacturer Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${tenant?.logoColor || 'bg-slate-400'}`} />
                        <span className="font-bold text-xs text-slate-900">{tenant?.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                        Subtotal: {formatCurrency(tenantSubtotal)}
                      </span>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <div
                          key={`${item.medicineId}-${item.batchId}`}
                          className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {item.medicineName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Lot: {item.batchNumber} • {formatCurrency(item.unitPrice)} / {item.packagingUnit}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-slate-800 tabular-nums">
                              {item.quantity} {item.packagingUnit}s
                            </span>
                            <span className="font-black text-slate-900 tabular-nums">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.medicineId, item.batchId)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Checkout Button per Manufacturer */}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleCheckoutTenant(tenantId)}
                      className="w-full"
                    >
                      Checkout with {tenant?.shortName} ({formatCurrency(tenantSubtotal)})
                    </Button>
                  </div>
                );
              })}

              {/* Combined Grand Total */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-sm font-bold">
                <span>Grand Total:</span>
                <span className="text-lg text-emerald-400 tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
