import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrowseMedicinesScreen } from './screens/BrowseMedicinesScreen';
import { OrderHistoryScreen } from './screens/OrderHistoryScreen';
import { AccountScreen } from './screens/AccountScreen';
import { WasteReturnScreen } from './screens/WasteReturnScreen';
import { Store, PackageCheck, ShieldCheck, ShoppingCart, AlertTriangle } from 'lucide-react';

interface DistributorPortalProps {
  onOpenCart: () => void;
  activeTab?: 'browse' | 'orders' | 'account' | 'waste';
  setActiveTab?: (tab: 'browse' | 'orders' | 'account' | 'waste') => void;
}

export const DistributorPortal: React.FC<DistributorPortalProps> = ({
  onOpenCart,
  activeTab: externalTab,
  setActiveTab: externalSetTab,
}) => {
  const { distributorOrders, distributorWasteRequests, cart } = useStore();
  const [internalTab, setInternalTab] = useState<'browse' | 'orders' | 'account' | 'waste'>('browse');

  const activeTab = externalTab ?? internalTab;
  const setActiveTab = externalSetTab ?? setInternalTab;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingWasteCount = distributorWasteRequests.filter(
    (w) => w.status === 'requested' || w.status === 'manufacturer_review'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'browse'
                ? 'bg-[#1A504C] text-white shadow-none'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Browse Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#1A504C] text-white shadow-none'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>My Orders & Shipments</span>
            {distributorOrders.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-[#143F3C] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {distributorOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'waste'
                ? 'bg-amber-600 text-white shadow-none font-bold'
                : 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'waste' ? 'text-white' : 'text-amber-600'}`} />
            <span>Expired / Unsold Returns</span>
            {pendingWasteCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'waste' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {pendingWasteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'account'
                ? 'bg-[#1A504C] text-white shadow-none'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Account & Licenses</span>
          </button>
        </div>

        {/* Mobile Sticky Cart Trigger */}
        <button
          onClick={onOpenCart}
          className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A504C] text-white text-xs font-bold shadow-none shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cartCount})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'browse' && <BrowseMedicinesScreen />}
        {activeTab === 'orders' && <OrderHistoryScreen />}
        {activeTab === 'waste' && <WasteReturnScreen />}
        {activeTab === 'account' && <AccountScreen />}
      </main>
    </div>
  );
};
