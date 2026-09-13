// Date, currency, and display formatters adhering strictly to prompt requirements

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    // If format starts with YYYY-MM-DD, parse tokens to prevent UTC-local timezone shift
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const parts = dateString.split('T')[0].split('-');
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!isNaN(year) && monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}-${year}`;
      }
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const formattedDate = formatDate(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${formattedDate} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

export interface ExpiryStatus {
  status: 'safe' | 'warning' | 'critical' | 'expired';
  label: string;
  monthsRemaining: number;
  daysRemaining: number;
  colorClass: string;
  bgClass: string;
}

export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) {
    return {
      status: 'safe',
      label: expiryDateStr || 'TBD',
      monthsRemaining: 12,
      daysRemaining: 365,
      colorClass: 'text-slate-600',
      bgClass: 'bg-slate-50 border-slate-200 text-slate-600',
    };
  }
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.round(daysRemaining / 30.4);

  if (daysRemaining <= 0) {
    return {
      status: 'expired',
      label: 'Expired',
      monthsRemaining: 0,
      daysRemaining,
      colorClass: 'text-rose-700 font-semibold',
      bgClass: 'bg-rose-50 border-rose-200 text-rose-700',
    };
  }

  if (monthsRemaining < 2) {
    return {
      status: 'critical',
      label: `${daysRemaining} days left (Near Expiry)`,
      monthsRemaining,
      daysRemaining,
      colorClass: 'text-red-700 font-semibold',
      bgClass: 'bg-red-50 border-red-200 text-red-700',
    };
  }

  if (monthsRemaining <= 6) {
    return {
      status: 'warning',
      label: `${monthsRemaining} months left`,
      monthsRemaining,
      daysRemaining,
      colorClass: 'text-amber-700 font-semibold',
      bgClass: 'bg-amber-50 border-amber-200 text-amber-700',
    };
  }

  return {
    status: 'safe',
    label: `${monthsRemaining} months left`,
    monthsRemaining,
    daysRemaining,
    colorClass: 'text-emerald-700 font-semibold',
    bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
}
