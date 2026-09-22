import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { computeEffectivePrice } from '../../../engine/pricingEngine';
import { sortBatchesFEFO } from '../../../engine/inventoryEngine';
import { Medicine, CartItem } from '../../../types';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Trash2,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Building2,
  CreditCard,
  Package,
  Plus,
  Minus,
  Sparkles,
  ChevronDown,
  Info,
  MapPin,
  Clock,
  Flame,
  Award,
  Lock,
  Percent,
  Check
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    addToCart,
    currentDistributor,
    tenants,
    medicines,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutOrder,
    navigateToPage,
    openLoginModal,
    addToast,
  } = useStore();

  const { isAuthenticated, currentUser } = useAuth();

  const [recommendedTab, setRecommendedTab] = useState<'frequent' | 'bestsellers' | 'high_margin'>('frequent');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'success'>('bag');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

  // Calculations
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const productDiscount = Math.max(0, mrpTotal - subtotal);
  const deliveryFee = subtotal > 5000 || cart.length === 0 ? 0 : 99; // Free delivery for orders above ₹5000
  const platformFee = 0; // FREE
  const totalPayable = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const totalSaved = productDiscount + couponDiscount + (deliveryFee === 0 && subtotal > 0 ? 99 : 0);

  // Group cart items by manufacturer principal
  const itemsByTenant = cart.reduce((acc, item) => {
    if (!acc[item.tenantId]) {
      acc[item.tenantId] = [];
    }
    acc[item.tenantId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const tenantIdsInCart = Object.keys(itemsByTenant);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal('Please sign in to apply wholesale distributor coupons and promotional schemes.');
      return;
    }
    const code = couponCode.trim().toUpperCase();
    if (code === 'PHARMA10' || code === 'WHOLESALE10') {
      const discount = Math.round(subtotal * 0.1);
      setCouponDiscount(discount);
      setAppliedCoupon(code);
      addToast('success', 'Coupon Applied!', `Extra 10% Wholesale Discount (-${formatCurrency(discount)}) activated.`);
    } else if (code === 'FREEDISPATCH') {
      setCouponDiscount(0);
      setAppliedCoupon(code);
      addToast('success', 'Free Express Dispatch Applied!', 'Zero shipping cost on entire shipment.');
    } else {
      addToast('error', 'Invalid Coupon', 'Code not applicable. Try "PHARMA10" for 10% off.');
    }
  };

  const handleCheckoutAll = () => {
    if (!isAuthenticated) {
      openLoginModal('Please log in or create an account to proceed with your wholesale order.');
      return;
    }

    if (cart.length === 0) {
      addToast('error', 'Cart Empty', 'Your order tray is empty.');
      return;
    }

    // Checkout each manufacturer tenant order
    let lastOrder = null;
    tenantIdsInCart.forEach((tId) => {
      const tenantItems = itemsByTenant[tId];
      const order = checkoutOrder({
        tenantId: tId,
        items: tenantItems,
        paymentMethod: 'credit',
        fulfilmentMethod: 'logistics_partner',
      });
      if (order) lastOrder = order;
    });

    if (lastOrder) {
      setPlacedOrderId((lastOrder as any).id);
      setCheckoutStep('success');
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Recommended Formulations Rail
  const recommendedMedicines = medicines.slice(0, 4);
  const recentlyViewed = medicines.slice(0, 3);

  const handleQuickAddRecommended = (med: Medicine) => {
    const validBatch = sortBatchesFEFO(med.batches).find((b) => b.availableQuantity > 0) || med.batches[0];
    const qty = med.rules.minOrderQty || 10;
    const priceResult = computeEffectivePrice(med, currentDistributor.id, qty);

    const item: CartItem = {
      medicineId: med.id,
      tenantId: med.tenantId,
      batchId: validBatch.id,
      quantity: qty,
      unitPrice: priceResult.effectiveUnitPrice,
      mrp: med.mrp,
      packagingUnit: med.packagingUnit,
      medicineName: med.name,
      genericName: med.genericName,
      batchNumber: validBatch.batchNumber,
      expiryDate: validBatch.expiryDate,
    };

    if (!isAuthenticated) {
      openLoginModal(
        `Please sign in or register to add ${qty} ${med.packagingUnit}s of ${med.name} to your cart.`,
        item
      );
      return;
    }

    addToCart(item);
  };

  if (checkoutStep === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Order Confirmed • Auto FEFO Allocated
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#1A1A1A]">
              Wholesale Order Successfully Placed!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your order ID <strong className="text-[#1A1A1A] font-mono">{placedOrderId}</strong> has been transmitted to principal warehouse dispatch. Batch-level inventory was immediately reserved under FEFO rules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigateToPage('orders')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Track Order & Invoices</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCheckoutStep('bag');
                navigateToPage('marketplace');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs transition-colors"
            >
              Continue Wholesale Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Breadcrumb & Status Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage('marketplace')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>

          <span className="text-gray-300">/</span>

          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#1A504C]" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              My Cart & Bag ({cart.reduce((sum, it) => sum + it.quantity, 0)} items)
            </h1>
          </div>
        </div>

        {/* Right Header: Delivery Hub Location and User Auth Pill (Netmeds Style) */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1 rounded-xl border border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-[#1A504C]" />
            <span className="text-[11px] font-bold">
              Deliver to: <strong className="text-[#1A1A1A]">{currentDistributor.state}, India</strong>
            </span>
          </div>

          {!isAuthenticated ? (
            <button
              onClick={() => openLoginModal('Sign in to access exclusive B2B wholesale pricing and instant dispatch.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Sign In</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-extrabold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{currentUser?.name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Netmeds Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Items in Cart (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-lg text-[#1A1A1A]">Your Wholesale Cart is Empty</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Explore our verified catalog of WHO-GMP pharmaceutical formulations, antibiotics, and cold-chain essentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('marketplace')}
                className="px-6 py-2.5 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-md transition-all"
              >
                Browse Marketplace Formulations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group by Manufacturer Principal */}
              {tenantIdsInCart.map((tenantId) => {
                const tenant = tenants.find((t) => t.id === tenantId);
                const tenantItems = itemsByTenant[tenantId];
                const tenantSubtotal = tenantItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

                return (
                  <div key={tenantId} className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
                    {/* Manufacturer Header Strip */}
                    <div className="bg-[#F5F8F6] p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${tenant?.logoColor || 'bg-emerald-600'}`} />
                        <span className="font-heading font-black text-sm text-[#1A1A1A]">
                          {tenant?.name}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200">
                          Form 25/28 Verified
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-[#1A504C]">
                        Subtotal: {formatCurrency(tenantSubtotal)}
                      </span>
                    </div>

                    {/* Netmeds-Style Cart Item Cards */}
                    <div className="divide-y divide-gray-100 p-2 sm:p-4">
                      {tenantItems.map((item) => {
                        const med = medicines.find((m) => m.id === item.medicineId);
                        const savingsPct = item.mrp > 0 ? Math.round(((item.mrp - item.unitPrice) / item.mrp) * 100) : 0;

                        return (
                          <div
                            key={`${item.medicineId}-${item.batchId}`}
                            className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 rounded-2xl transition-colors"
                          >
                            {/* Left: Product Pack Image + Details */}
                            <div className="flex items-start gap-4">
                              {/* Product Packaging Photo Container */}
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                                {med?.imageUrl ? (
                                  <img
                                    src={med.imageUrl}
                                    alt={item.medicineName}
                                    className="w-full h-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="text-lg font-black text-[#1A504C]">
                                    {item.medicineName.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>

                              {/* Titles & Pricing Breakdown */}
                              <div className="space-y-1">
                                <h4 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] leading-tight">
                                  {item.medicineName}
                                </h4>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  Generic: {item.genericName} • Pack of {med?.packSize || '10 x 10'}
                                </p>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  Batch: {item.batchNumber} • Exp: {formatDate(item.expiryDate)}
                                </div>

                                {/* Price with Struck MRP & Savings Tag (Netmeds Pattern) */}
                                <div className="flex items-baseline gap-2 pt-1">
                                  <span className="font-heading font-black text-base text-[#1A1A1A]">
                                    {formatCurrency(item.unitPrice)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(item.mrp)}
                                  </span>
                                  {savingsPct > 0 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                                      {savingsPct}% OFF
                                    </span>
                                  )}
                                </div>

                                {/* Delivery Schedule */}
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold pt-0.5">
                                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Delivery by Tomorrow, 4h Express Dispatch</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Quantity Stepper & Remove Action */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
                              {/* Netmeds Quantity Stepper Control */}
                              <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.medicineId, item.batchId, Math.max(0, item.quantity - (med?.rules.orderMultiple || 10)))}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200 transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-xs font-black text-[#1A1A1A] tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.medicineId, item.batchId, item.quantity + (med?.rules.orderMultiple || 10))}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200 transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Remove Item Button */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.medicineId, item.batchId)}
                                className="text-gray-400 hover:text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* NETMEDS LOWER SECTION: Recently Viewed & Promotions   */}
          {/* ---------------------------------------------------- */}
          <div className="space-y-6 pt-4">
            {/* 1. Recently Viewed Rail */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-base text-[#1A1A1A]">
                  Recently Viewed Formulations
                </h3>
                <span className="text-xs text-gray-400 font-medium">Auto-tracked</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentlyViewed.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#1A504C] transition-all bg-white flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="w-full h-28 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                        {med.imageUrl ? (
                          <img
                            src={med.imageUrl}
                            alt={med.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : null}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider">
                          Added
                        </span>
                      </div>
                      <h5 className="font-heading font-extrabold text-xs text-[#1A1A1A] line-clamp-1">
                        {med.name}
                      </h5>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-black text-[#1A1A1A]">
                          {formatCurrency(med.pricing.standardDistributorPrice)}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through">
                          {formatCurrency(med.mrp)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-between">
                      <span>Delivery: Tomorrow</span>
                      <span className="text-emerald-700 font-bold">Fresh FEFO</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Promotional B2B Deal Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs text-[#1A1A1A]">
                    India's Best Medicine Deals
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Direct manufacturer wholesale PTR discounts with guaranteed GST ITC claims.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs text-[#1A1A1A]">
                    Certified Cold-Chain (2°C–8°C)
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Temperature-monitored refrigerated transport for biologicals and critical injectables.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Recommended for You Rail with Quick Add Buttons */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading font-black text-base text-[#1A1A1A]">
                  Recommended For Your Wholesale Tray
                </h3>
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRecommendedTab('frequent')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      recommendedTab === 'frequent' ? 'bg-white text-[#1A504C] shadow-2xs' : 'text-gray-500'
                    }`}
                  >
                    Frequently Bought
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendedTab('bestsellers')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      recommendedTab === 'bestsellers' ? 'bg-white text-[#1A504C] shadow-2xs' : 'text-gray-500'
                    }`}
                  >
                    Bestsellers
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendedTab('high_margin')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      recommendedTab === 'high_margin' ? 'bg-white text-[#1A504C] shadow-2xs' : 'text-gray-500'
                    }`}
                  >
                    High Margin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedMedicines.map((med) => {
                  const savingsPct = med.mrp > 0 ? Math.round(((med.mrp - med.pricing.standardDistributorPrice) / med.mrp) * 100) : 0;
                  return (
                    <div
                      key={med.id}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#1A504C] transition-all bg-white flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="w-full h-28 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                          {med.imageUrl ? (
                            <img
                              src={med.imageUrl}
                              alt={med.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleQuickAddRecommended(med)}
                            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                            title="Quick Add MOQ"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                        <h5 className="font-heading font-black text-xs text-[#1A1A1A] line-clamp-1">
                          {med.name}
                        </h5>
                        <div className="text-[10px] text-gray-500">{med.packSize}</div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-black text-[#1A1A1A]">
                            {formatCurrency(med.pricing.standardDistributorPrice)}
                          </span>
                          <span className="text-[10px] text-rose-600 font-extrabold">
                            {savingsPct}% OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Netmeds Payment Details & Login to Proceed Box (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          
          {/* Card 1: Apply Coupon / Vouchers (Netmeds Layout) */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#1A1A1A]">
              <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5" />
              </div>
              <span>Apply coupon / vouchers</span>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-gray-500">
                  Login to see best wholesale offers & promotional schemes.
                </p>
                <button
                  type="button"
                  onClick={() => openLoginModal('Sign in to view wholesale volume rebates and apply coupons.')}
                  className="w-full py-2.5 rounded-xl border border-gray-300 hover:border-[#1A504C] text-[#1A504C] font-extrabold text-xs transition-colors"
                >
                  Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. PHARMA10"
                  className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs font-mono uppercase font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#1A504C] text-white font-extrabold text-xs shadow-2xs hover:bg-[#143F3C]"
                >
                  Apply
                </button>
              </form>
            )}

            {appliedCoupon && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>Code {appliedCoupon} applied</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
          </div>

          {/* Card 2: NETMEDS PAYMENT DETAILS CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
            
            {/* Header: If unauthenticated, show Netmeds Prompt */}
            {!isAuthenticated ? (
              <div className="text-xs font-black text-gray-600 pb-1 border-b border-gray-100">
                Please Login to proceed with your order
              </div>
            ) : (
              <div className="text-xs font-black uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
                Payment details
              </div>
            )}

            {/* Line items breakdown */}
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>MRP Total</span>
                <span className="font-mono font-bold text-gray-900 tabular-nums">
                  {formatCurrency(mrpTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span>Product Discount</span>
                <span className="font-mono font-bold tabular-nums">
                  -{formatCurrency(productDiscount)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Coupon Rebate</span>
                  <span className="font-mono font-bold tabular-nums">
                    -{formatCurrency(couponDiscount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Delivery Fee</span>
                  <Info className="w-3 h-3 text-gray-400" />
                </span>
                <span className="font-mono font-bold text-gray-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Platform Fee</span>
                <span className="font-mono font-bold text-emerald-700">
                  FREE
                </span>
              </div>
            </div>

            {/* Total Payable Row */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="font-heading font-black text-sm text-[#1A1A1A]">
                Total Payable
              </span>
              <span className="font-heading font-black text-lg text-[#1A504C] tabular-nums">
                {formatCurrency(totalPayable)}
              </span>
            </div>

            {/* Green You Saved Banner (Netmeds Pill) */}
            {totalSaved > 0 && (
              <div className="p-3 rounded-2xl bg-[#E8F3F1] text-[#1A504C] border border-[#1A504C]/20 flex items-center justify-between text-xs font-extrabold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1A504C]" />
                  <span>You saved a total of {formatCurrency(totalSaved)}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            )}

            {/* Primary Action Button */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => openLoginModal('Please log in or register your wholesale account to place your order.')}
                className="w-full py-3.5 rounded-2xl bg-[#20BD5A] hover:bg-[#1CA84F] text-white font-heading font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCheckoutAll}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1A504C] to-[#123E3A] hover:from-[#143F3C] hover:to-[#0A2624] text-white font-heading font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* B2B Compliance Note */}
            <div className="pt-2 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#1A504C]" />
              <span>100% Verified Wholesale Order • CDSCO Form 20B/21B Validated</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
