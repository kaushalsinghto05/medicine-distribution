import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import {
  AlertTriangle,
  RotateCcw,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  FileCheck2,
  AlertCircle,
  Camera,
  Layers,
} from 'lucide-react';

export const WasteReturnScreen: React.FC = () => {
  const {
    currentDistributor,
    distributorAuthorizedTenants,
    distributorMedicines,
    distributorOrders,
    distributorWasteRequests,
    createDistributorWasteRequest,
    addToast,
  } = useStore();

  const { currentUser } = useAuth();

  // Find all batches purchased by this distributor in past delivered orders
  const receivedBatches: {
    medicineId: string;
    medicineName: string;
    tenantId: string;
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    packagingUnit: string;
    orderNumber: string;
    purchasedQty: number;
  }[] = [];

  distributorOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      receivedBatches.push({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        tenantId: ord.tenantId,
        batchId: item.batchId,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        packagingUnit: item.packagingUnit,
        orderNumber: ord.orderNumber,
        purchasedQty: item.fulfilledQuantity,
      });
    });
  });

  // Modal State for new Waste Return Request
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedBatchKey, setSelectedBatchKey] = useState<string>(
    receivedBatches[0] ? `${receivedBatches[0].batchId}-${receivedBatches[0].orderNumber}` : ''
  );
  const [returnQty, setReturnQty] = useState<number>(10);
  const [returnReason, setReturnReason] = useState<'expired' | 'damaged_transit' | 'near_expiry_return' | 'recall'>('expired');
  const [mockPhotoName, setMockPhotoName] = useState<string>('photo-evidence-blister.jpg');
  const [distributorNotes, setDistributorNotes] = useState<string>('');

  // Selected batch object
  const selectedBatchObj = receivedBatches.find(
    (b) => `${b.batchId}-${b.orderNumber}` === selectedBatchKey
  ) || receivedBatches[0];

  // Check for any recalled batches in distributor catalog
  const recalledMedicines = distributorMedicines.filter((m) =>
    m.batches.some((b) => b.status === 'recalled' || b.recalled)
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchObj) {
      addToast('error', 'Select Batch', 'Please select a batch from your received order history.');
      return;
    }

    if (returnQty <= 0) {
      addToast('error', 'Invalid Quantity', 'Quantity must be greater than zero.');
      return;
    }

    createDistributorWasteRequest({
      tenantId: selectedBatchObj.tenantId,
      medicineId: selectedBatchObj.medicineId,
      batchId: selectedBatchObj.batchId,
      batchNumber: selectedBatchObj.batchNumber,
      quantity: Number(returnQty),
      packagingUnit: selectedBatchObj.packagingUnit,
      reason: returnReason,
      photoEvidenceUrl: mockPhotoName,
      distributorNotes,
    });

    setIsNewRequestOpen(false);
    setDistributorNotes('');
  };

  // Stepper Visual Helper
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'requested':
        return 0;
      case 'manufacturer_review':
        return 1;
      case 'approved':
      case 'collection_scheduled':
        return 2;
      case 'disposed_credited':
        return 3;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Requested', desc: 'Claim filed with photo evidence' },
    { label: 'QA Review', desc: 'Manufacturer evaluation' },
    { label: 'Collection', desc: 'Hazard pickup scheduled' },
    { label: 'Settled & Disposed', desc: 'Credit issued or stock replaced' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 via-slate-900 to-amber-950 rounded-2xl p-6 text-white shadow-md border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Wholesale Regulatory Waste Protocol
            </span>
            <span className="text-xs text-slate-400">
              Separated from standard returns
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl tracking-tight text-white mt-2">
            Expired & Unsold Stock Disposal Portal
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Safely report expired batches, in-transit damaged goods, or mandatory manufacturer recalls for authorized disposal and credit reconciliation per pharma safety compliance.
          </p>
        </div>

        <button
          onClick={() => setIsNewRequestOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-none transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Report Waste / Request Return</span>
        </button>
      </div>

      {/* Recalled Batch Alert Notice */}
      {recalledMedicines.length > 0 && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider">
              Urgent Manufacturer Batch Recall Notice
            </h4>
          </div>
          <p className="text-xs text-rose-800">
            One or more batches in your catalog or purchase history have been marked for immediate quarantine under a manufacturer recall notice. Do not dispense these units to pharmacies or healthcare centers.
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {recalledMedicines.map((m) => {
              const recBatch = m.batches.find((b) => b.status === 'recalled' || b.recalled);
              return (
                <span
                  key={m.id}
                  className="px-2.5 py-1 rounded-lg bg-rose-200/80 border border-rose-300 text-rose-950 text-[11px] font-bold"
                >
                  {m.name} (Batch: {recBatch?.batchNumber})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Requests History with Visual Steppers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">Your Waste & Expiry Return Requests</h2>
            <p className="text-xs text-slate-500">Live regulatory tracking of all submitted claims.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {distributorWasteRequests.length} Claim(s)
          </span>
        </div>

        {distributorWasteRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-3 shadow-none">
            <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Pending Waste or Expiry Claims</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              You're all caught up! When you identify damaged or expired stock from your received shipments, use "Report Waste / Request Return" above to initiate a regulatory reverse return.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {distributorWasteRequests.map((req) => {
              const currentStep = getStepIndex(req.status);
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-none space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{req.id}</span>
                        <StatusBadge status={req.status} size="sm" />
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {req.reason.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Filed on {formatDateTime(req.createdAt)} • Manufacturer: <strong>{req.tenantId}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Claimed Quantity</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {req.quantity} {req.packagingUnit}s
                      </span>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  {!isRejected ? (
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center relative">
                        {steps.map((s, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={s.label} className="relative flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                                  isDone
                                    ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className={`font-bold text-[11px] ${isCurrent ? 'text-amber-800' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {s.label}
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:block">
                                {s.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                      <strong>Claim Rejected by Manufacturer:</strong> {req.rejectionReason || 'Inspection criteria not met.'}
                    </div>
                  )}

                  {/* Details Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Medicine Formulation</span>
                      <span className="font-bold text-slate-800 text-xs block">{req.medicineName}</span>
                      <span className="font-mono text-slate-500">Batch: {req.batchNumber}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Policy</span>
                      <span className="font-semibold text-slate-800 block capitalize">
                        {req.compensationType ? req.compensationType.replace(/_/g, ' ') : 'Pending Approval'}
                      </span>
                      {req.creditAmount ? (
                        <span className="text-teal-700 font-bold block">
                          Credit Authorized: {formatCurrency(req.creditAmount)}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Evidence Attached</span>
                      <span className="text-sky-700 font-medium underline flex items-center gap-1 cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{req.photoEvidenceUrl || 'evidence-photo.jpg'}</span>
                      </span>
                    </div>
                  </div>

                  {req.manufacturerNotes && (
                    <p className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                      <strong>Manufacturer Response:</strong> {req.manufacturerNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: REPORT NEW WASTE CLAIM */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <RotateCcw className="w-5 h-5" />
                <span>File Expired / Unsold Stock Return Claim</span>
              </div>
              <button
                onClick={() => setIsNewRequestOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Received Medicine & Batch
                </label>
                {receivedBatches.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                    No past delivered orders found in your distributor account.
                  </div>
                ) : (
                  <select
                    value={selectedBatchKey}
                    onChange={(e) => setSelectedBatchKey(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800"
                    required
                  >
                    {receivedBatches.map((b) => (
                      <option key={`${b.batchId}-${b.orderNumber}`} value={`${b.batchId}-${b.orderNumber}`}>
                        {b.medicineName} • Batch #{b.batchNumber} (From {b.orderNumber}, {b.purchasedQty} {b.packagingUnit}s)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Return Quantity ({selectedBatchObj?.packagingUnit || 'strip'}s)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedBatchObj?.purchasedQty || 1000}
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="expired">Expired on Shelf</option>
                    <option value="near_expiry_return">Near-Expiry Threshold Return</option>
                    <option value="damaged_transit">Damaged in Transit / Seal Broken</option>
                    <option value="recall">Manufacturer Mandatory Recall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mandatory Photo Evidence (Mock Upload)
                </label>
                <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-xl p-3 text-center">
                  <Camera className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="font-semibold text-amber-900 block text-xs">{mockPhotoName}</span>
                  <span className="text-[10px] text-slate-400">Blister seal & barcode capture verified</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Claim Notes & Description</label>
                <textarea
                  rows={2}
                  value={distributorNotes}
                  onChange={(e) => setDistributorNotes(e.target.value)}
                  placeholder="Describe damage, storage condition, or expiry justification..."
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRequestOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Submit Waste Return Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
