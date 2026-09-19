import React from 'react';
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  Building2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderLifecycleStepperProps {
  currentStatus: OrderStatus;
  orderDate?: string;
  className?: string;
}

export const OrderLifecycleStepper: React.FC<OrderLifecycleStepperProps> = ({
  currentStatus,
  orderDate,
  className = '',
}) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className={`p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 ${className}`}>
        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold text-xs">Order Cancelled</span>
          <p className="text-[11px] text-rose-600">This purchase order was cancelled. Reserved inventory was restored to batch stock.</p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'returned') {
    return (
      <div className={`p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 ${className}`}>
        <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold text-xs">Order Returned & Stock Restocked</span>
          <p className="text-[11px] text-amber-700">A return claim was approved. Batch inventory has been atomically credited back to manufacturer warehouse.</p>
        </div>
      </div>
    );
  }

  const steps: { id: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'new', label: 'Order Placed', icon: Clock },
    { id: 'confirmed', label: 'Principal Confirmed', icon: CheckCircle2 },
    { id: 'processing', label: 'Picking & Packing', icon: PackageCheck },
    { id: 'ready_for_dispatch', label: 'Manifest Ready', icon: Building2 },
    { id: 'dispatched', label: 'In Transit', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const statusOrder: OrderStatus[] = [
    'new',
    'confirmed',
    'processing',
    'ready_for_dispatch',
    'dispatched',
    'delivered',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={`w-full py-2 overflow-x-auto ${className}`}>
      <div className="flex items-center justify-between min-w-[500px]">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex-1 flex items-center last:flex-none">
              <div className="flex flex-col items-center text-center group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-semibold whitespace-nowrap block ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-indigo-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
