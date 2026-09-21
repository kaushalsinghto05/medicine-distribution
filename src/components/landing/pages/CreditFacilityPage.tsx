import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency } from '../../../utils/formatters';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';

export const CreditFacilityPage: React.FC = () => {
  const { navigateToPage, currentDistributor, addToast } = useStore();
  const [requestedAmount, setRequestedAmount] = useState('');

  const totalCreditLimit = 1500000; // ₹15 Lakhs
  const utilizedCredit = 420000; // ₹4.2 Lakhs
  const availableCredit = totalCreditLimit - utilizedCredit;

  const invoices = [
    { id: 'INV-2024-8812', principal: 'Apex Laboratories', amount: 185000, dueDate: '2026-10-15', terms: 'Net-30', status: 'Payment Due in 23 Days' },
    { id: 'INV-2024-8740', principal: 'BioPharma Ltd', amount: 235000, dueDate: '2026-10-28', terms: 'Net-30', status: 'Payment Due in 36 Days' },
  ];

  const handleRequestIncrease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedAmount || isNaN(Number(requestedAmount))) {
      addToast('error', 'Invalid Input', 'Please enter a valid amount.');
      return;
    }
    addToast(
      'success',
      'Facility Request Submitted',
      `Application for ${formatCurrency(Number(requestedAmount))} trade credit limit expansion submitted for principal review.`
    );
    setRequestedAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A504C] font-extrabold text-xs transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <span className="text-gray-300">/</span>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1A504C]" />
            <h1 className="font-heading font-black text-sm sm:text-base text-[#1A1A1A] tracking-tight">
              Wholesale Trade Credit Facility & Settlement Terms
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigateToPage('marketplace')}
          className="px-4 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Order on Credit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Credit Facility Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] uppercase">
                Active Wholesale Facility
              </span>
              <span className="text-xs text-[#6B7280]">
                Institutional Account: <strong className="text-[#1A1A1A]">{currentDistributor.name}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1A1A1A] tracking-tight mt-1">
              ₹15,00,000 Institutional Trade Credit Line
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Statutory revolving trade financing supported by verified CDSCO manufacturer principals
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Available Buffer</div>
            <div className="text-3xl font-heading font-black text-[#1A504C] tabular-nums">
              {formatCurrency(availableCredit)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
              Net-30 Settlement Active
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200">
            <span className="text-xs font-bold text-[#6B7280] uppercase">Total Authorized Limit</span>
            <div className="text-2xl font-heading font-extrabold text-[#1A1A1A] mt-1 tabular-nums">
              {formatCurrency(totalCreditLimit)}
            </div>
            <span className="text-[11px] text-[#1A504C] font-semibold mt-0.5 block">Approved across 4 principals</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-gray-200">
            <span className="text-xs font-bold text-[#6B7280] uppercase">Utilized Invoices</span>
            <div className="text-2xl font-heading font-extrabold text-[#EA580C] mt-1 tabular-nums">
              {formatCurrency(utilizedCredit)}
            </div>
            <span className="text-[11px] text-[#6B7280] mt-0.5 block">2 active wholesale dispatches</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F3F1] border border-teal-200">
            <span className="text-xs font-bold text-[#1A504C] uppercase">Settlement Window</span>
            <div className="text-2xl font-heading font-extrabold text-[#1A504C] mt-1">
              Net-30 Days
            </div>
            <span className="text-[11px] text-teal-700 font-semibold mt-0.5 block">Interest-free trade credit</span>
          </div>
        </div>

        {/* Active Invoices Table */}
        <div className="space-y-3 pt-2">
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#1A1A1A]">
            Current Invoices Under Credit Facility
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8F6] border-b border-gray-200 font-bold text-[#6B7280] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Manufacturer Principal</th>
                  <th className="p-3">Invoice Amount</th>
                  <th className="p-3">Payment Terms</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#1A504C]">{inv.id}</td>
                    <td className="p-3 font-bold text-[#1A1A1A]">{inv.principal}</td>
                    <td className="p-3 font-bold text-[#1A1A1A] tabular-nums">{formatCurrency(inv.amount)}</td>
                    <td className="p-3 text-[#6B7280]">{inv.terms}</td>
                    <td className="p-3 text-[#1A1A1A]">{inv.dueDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Limit Expansion Form */}
        <div className="p-5 rounded-2xl bg-[#F5F8F6] border border-gray-200 space-y-3">
          <h4 className="font-heading font-bold text-sm text-[#1A1A1A]">
            Request Trade Credit Limit Expansion
          </h4>
          <p className="text-xs text-[#6B7280]">
            Wholesale buyers with a history of on-time Net-30 settlements qualify for facility increases up to ₹50,00,000.
          </p>
          <form onSubmit={handleRequestIncrease} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="number"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder="Enter requested limit (e.g. 2500000)"
              className="w-full sm:w-72 px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white font-extrabold text-xs shadow-xs transition-all"
            >
              Submit Expansion Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
