import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency } from '../../../utils/formatters';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface MobileStickyCartBarProps {
  onOpenCart: () => void;
}

export const MobileStickyCartBar: React.FC<MobileStickyCartBarProps> = ({ onOpenCart }) => {
  const { cart, navigateToPage } = useStore();

  if (cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Cart Item Summary */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E8F3F1] text-[#1A504C] text-xs font-bold">
              {cart.length} {cart.length === 1 ? 'SKU' : 'SKUs'} ({totalItems} Units)
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs text-[#6B7280]">Total:</span>
            <span className="text-base font-extrabold text-[#1A1A1A] tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        {/* View Cart Action Button (Apollo Teal) */}
        <button
          onClick={() => navigateToPage('cart')}
          className="px-4 py-2.5 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-bold text-xs uppercase shadow-sm flex items-center gap-1.5 active:scale-95 shrink-0 transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
