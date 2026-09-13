import React from 'react';
import { OrderStatus, DistributorApprovalStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | DistributorApprovalStatus | 'draft' | 'published' | 'unregistered';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const getStyle = () => {
    switch (status) {
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

  const formatLabel = () => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {formatLabel()}
    </span>
  );
};
