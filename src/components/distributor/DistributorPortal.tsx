import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrowseMedicinesScreen } from './screens/BrowseMedicinesScreen';
import { OrderHistoryScreen } from './screens/OrderHistoryScreen';
import { AccountScreen } from './screens/AccountScreen';
import { Store, PackageCheck, ShieldCheck, ShoppingCart } from 'lucide-react';

interface DistributorPortalProps {
  onOpenCart: () => void;
  activeTab?: 'browse' | 'orders' | 'account';
  setActiveTab?: (tab: 'browse' | 'orders' | 'account') => void;
}

export const DistributorPortal: React.FC<DistributorPortalProps> = ({
  onOpenCart,
  activeTab: externalTab,
  setActiveTab: externalSetTab,
}) => {
  const { distributorOrders, cart } = useStore();
  const [internalTab, setInternalTab] = useState<'browse' | 'orders' | 'account'>('browse');

  const activeTab = externalTab ?? internalTab;
  const setActiveTab = externalSetTab ?? setInternalTab;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Browse Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>My Orders & Shipments</span>
            {distributorOrders.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {distributorOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white shadow-xs'
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
          className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cartCount})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'browse' && <BrowseMedicinesScreen />}
        {activeTab === 'orders' && <OrderHistoryScreen />}
        {activeTab === 'account' && <AccountScreen />}
      </main>
    </div>
  );
};
