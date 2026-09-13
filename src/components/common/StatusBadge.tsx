import React from 'react';
import { OrderStatus, DistributorApprovalStatus, BatchLifecycleStatus, DisposalRequestStatus, WasteReturnStatus } from '../../types';
import { AlertTriangle, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status:
    | OrderStatus
    | DistributorApprovalStatus
    | BatchLifecycleStatus
    | DisposalRequestStatus
    | WasteReturnStatus
    | 'draft'
    | 'published'
    | 'unregistered';
  size?: 'sm' | 'md' | 'lg';
  showHazardIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showHazardIcon = true }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const getStyle = () => {
    switch (status) {
      // Waste & Expiry Hazard Accents (amber/rose hazard tone)
      case 'near_expiry':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'expired_damaged':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      case 'flagged_for_disposal':
        return 'bg-orange-50 text-orange-900 border-orange-400 font-semibold';
      case 'collected_for_disposal':
      case 'pickup_scheduled':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'disposed':
      case 'destroyed':
      case 'disposed_credited':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
      case 'recalled':
        return 'bg-red-100 text-red-900 border-red-400 font-extrabold animate-pulse';

      // Waste Return statuses
      case 'requested':
      case 'manufacturer_review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'collection_scheduled':
        return 'bg-amber-50 text-amber-800 border-amber-300';

      // Order Statuses
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ready_for_dispatch':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'dispatched':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'returned':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      // Distributor Statuses
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'rejected':
        return 'bg-slate-100 text-slate-700 border-slate-300';

      // Medicine Statuses
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isHazard = ['near_expiry', 'expired_damaged', 'flagged_for_disposal', 'recalled'].includes(status);

  const formatLabel = () => {
    return status.replace(/_/g, ' ').toUpperCase();
  };


  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeClasses[size]} ${getStyle()}`}
    >
      {isHazard && showHazardIcon ? (
        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-700 animate-pulse" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full mr-1 bg-current opacity-75"></span>
      )}
      <span>{formatLabel()}</span>
    </span>
  );
};
