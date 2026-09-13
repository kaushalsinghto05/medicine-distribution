import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { Batch, WasteDisposalRequest, WasteReturnRequest } from '../../../types';
import { formatCurrency, formatDate, formatDateTime, getExpiryStatus } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import {
  AlertTriangle,
  Flame,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  Building2,
  Truck,
  Upload,
  Download,
  Clock,
  Search,
} from 'lucide-react';

export const WasteManagementScreen: React.FC = () => {
  const {
    currentTenant,
    tenantMedicines,
    tenantWastePartners,
    tenantWasteDisposalRequests,
    tenantWasteReturnRequests,
    tenantComplianceLedger,
    currentTenantWasteConfig,
    raiseDisposalRequest,
    completeDisposalWithCertificate,
    triggerBatchRecall,
    approveDistributorWasteReturn,
    rejectDistributorWasteReturn,
    updateWasteConfig,
    addToast,
  } = useStore();

  const { currentUser, checkPermission } = useAuth();
  const isAdmin = checkPermission('approve_disposal');

  const [activeTab, setActiveTab] = useState<'inventory' | 'disposal_ops' | 'returns' | 'compliance' | 'config'>('inventory');

  // Modal States
  const [disposalModalBatch, setDisposalModalBatch] = useState<{ batch: Batch; medicineId: string; medicineName: string } | null>(null);
  const [disposalQty, setDisposalQty] = useState<number>(100);
  const [disposalPartnerId, setDisposalPartnerId] = useState<string>(tenantWastePartners[0]?.id || '');
  const [disposalDate, setDisposalDate] = useState<string>('2026-09-22');
  const [disposalMethod, setDisposalMethod] = useState<string>('High-temp Incineration (1100°C)');
  const [disposalNotes, setDisposalNotes] = useState<string>('');

  const [certModalRequest, setCertModalRequest] = useState<WasteDisposalRequest | null>(null);
  const [certNumberInput, setCertNumberInput] = useState<string>('');
  const [mockFileName, setMockFileName] = useState<string>('CPCB-Destruction-Cert-2026.pdf');
  const [certNotes, setCertNotes] = useState<string>('');

  const [recallModalBatch, setRecallModalBatch] = useState<{ batch: Batch; medicineId: string; medicineName: string } | null>(null);
  const [recallReasonInput, setRecallReasonInput] = useState<string>('');

  const [reviewReturnModal, setReviewReturnModal] = useState<WasteReturnRequest | null>(null);
  const [compensationType, setCompensationType] = useState<'replace_stock' | 'credit_note' | 'none_recall'>('credit_note');
  const [creditAmountInput, setCreditAmountInput] = useState<number>(0);
  const [reviewDecisionNotes, setReviewDecisionNotes] = useState<string>('');

  const [configThresholdDays, setConfigThresholdDays] = useState<number>(currentTenantWasteConfig.nearExpiryThresholdDays || 60);
  const [configDefaultPartner, setConfigDefaultPartner] = useState<string>(currentTenantWasteConfig.defaultWastePartnerId || tenantWastePartners[0]?.id || '');
  const [configPolicy, setConfigPolicy] = useState<'replace_stock' | 'credit_note' | 'none_recall'>(currentTenantWasteConfig.defaultCompensationPolicy || 'credit_note');
  const [configPhotoReq, setConfigPhotoReq] = useState<boolean>(currentTenantWasteConfig.requirePhotoEvidence);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'near_expiry' | 'expired_damaged' | 'recalled' | 'flagged_for_disposal'>('all');

  const allBatches = tenantMedicines.flatMap((med) =>
    med.batches.map((batch) => {
      const expStatus = getExpiryStatus(batch.expiryDate);
      const isNearExpiry = expStatus.status === 'warning' || expStatus.status === 'critical' || expStatus.daysRemaining <= currentTenantWasteConfig.nearExpiryThresholdDays;
      const isExpired = expStatus.status === 'expired' || batch.status === 'expired_damaged';
      const isRecalled = batch.status === 'recalled' || batch.recalled;
      const isFlagged = batch.status === 'flagged_for_disposal';

      return {
        medicineId: med.id,
        medicineName: med.name,
        genericName: med.genericName,
        category: med.category,
        batch,
        expStatus,
        isAtRisk: isNearExpiry || isExpired || isRecalled || isFlagged,
        computedStatus: isRecalled
          ? 'recalled'
          : isFlagged
          ? 'flagged_for_disposal'
          : isExpired
          ? 'expired_damaged'
          : isNearExpiry
          ? 'near_expiry'
          : 'active',
      };
    })
  );

  const atRiskBatches = allBatches.filter((b) => b.isAtRisk);

  const filteredBatches = atRiskBatches.filter((b) => {
    const matchesSearch =
      b.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.computedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const batchesNearExpiryCount = atRiskBatches.filter((b) => b.computedStatus === 'near_expiry').length;
  const expiredStockValue = atRiskBatches
    .filter((b) => b.computedStatus === 'expired_damaged' || b.computedStatus === 'flagged_for_disposal')
    .reduce((sum, b) => sum + (b.batch.flaggedQuantity || b.batch.availableQuantity) * (b.batch.costPrice || b.batch.mrp * 0.5), 0);
  const pendingDisposalsCount = tenantWasteDisposalRequests.filter((r) => r.status !== 'destroyed').length;
  const completedDisposalsCount = tenantWasteDisposalRequests.filter((r) => r.status === 'destroyed').length;
  const pendingDistributorReturnsCount = tenantWasteReturnRequests.filter((r) => r.status === 'requested' || r.status === 'manufacturer_review').length;

  const handleOpenDisposalModal = (b: (typeof atRiskBatches)[0]) => {
    setDisposalModalBatch({
      batch: b.batch,
      medicineId: b.medicineId,
      medicineName: b.medicineName,
    });
    setDisposalQty(b.batch.availableQuantity > 0 ? b.batch.availableQuantity : b.batch.flaggedQuantity || 100);
    setDisposalPartnerId(tenantWastePartners[0]?.id || '');
    setDisposalNotes('');
  };

  const handleSubmitDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposalModalBatch) return;

    raiseDisposalRequest({
      batchId: disposalModalBatch.batch.id,
      medicineId: disposalModalBatch.medicineId,
      quantity: Number(disposalQty),
      partnerId: disposalPartnerId,
      scheduledDate: disposalDate,
      disposalMethod,
      notes: disposalNotes,
    });

    setDisposalModalBatch(null);
  };

  const handleOpenCertModal = (req: WasteDisposalRequest) => {
    setCertModalRequest(req);
    setCertNumberInput(`COD-CPCB-${Math.floor(100000 + Math.random() * 900000)}`);
    setMockFileName(`Destruction_Cert_${req.batchNumber}_${new Date().toISOString().slice(0, 10)}.pdf`);
    setCertNotes('');
  };

  const handleSubmitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certModalRequest || !certNumberInput.trim()) return;

    completeDisposalWithCertificate({
      requestId: certModalRequest.id,
      certificateNumber: certNumberInput,
      certificateFileMockName: mockFileName,
      notes: certNotes,
    });

    setCertModalRequest(null);
  };

  const handleOpenRecallModal = (b: (typeof atRiskBatches)[0]) => {
    setRecallModalBatch({
      batch: b.batch,
      medicineId: b.medicineId,
      medicineName: b.medicineName,
    });
    setRecallReasonInput('Out-of-specification assay limits identified during routine shelf-life validation.');
  };

  const handleSubmitRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallModalBatch || !recallReasonInput.trim()) return;

    triggerBatchRecall({
      batchId: recallModalBatch.batch.id,
      medicineId: recallModalBatch.medicineId,
      recallReason: recallReasonInput,
    });

    setRecallModalBatch(null);
  };

  const handleOpenReviewReturn = (req: WasteReturnRequest) => {
    setReviewReturnModal(req);
    setCompensationType(req.reason === 'recall' ? 'none_recall' : currentTenantWasteConfig.defaultCompensationPolicy || 'credit_note');
    setCreditAmountInput(req.quantity * 85);
    setReviewDecisionNotes('');
  };

  const handleSubmitReviewReturn = (decision: 'approve' | 'reject') => {
    if (!reviewReturnModal) return;

    if (decision === 'approve') {
      approveDistributorWasteReturn({
        requestId: reviewReturnModal.id,
        compensationType,
        creditAmount: compensationType === 'credit_note' ? creditAmountInput : 0,
        notes: reviewDecisionNotes,
      });
    } else {
      rejectDistributorWasteReturn(
        reviewReturnModal.id,
        reviewDecisionNotes || 'Defect/reason outside authorized return policy parameters.'
      );
    }
    setReviewReturnModal(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateWasteConfig(currentTenant.id, {
      nearExpiryThresholdDays: Number(configThresholdDays),
      defaultWastePartnerId: configDefaultPartner,
      defaultCompensationPolicy: configPolicy,
      requirePhotoEvidence: configPhotoReq,
    });
  };

  const handleExportComplianceCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Batch', 'Medicine', 'Quantity', 'Certificate Ref', 'Notes'];
    const rows = tenantComplianceLedger.map((c) => [
      c.id,
      c.timestamp,
      `"${c.actorName}"`,
      c.actorRole,
      c.actionType,
      c.batchNumber,
      `"${c.medicineName}"`,
      c.quantity,
      c.certificateRef || 'N/A',
      `"${c.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Compliance_Audit_Ledger_${currentTenant.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Compliance Ledger Exported', 'CSV download initiated for regulatory reporting.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 rounded-2xl p-6 text-white shadow-md border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Hazardous & Expired Medicine Management
            </span>
            <span className="text-xs text-slate-400">CPCB / State Pollution Board Compliance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            Waste, Near-Expiry & Recall Operations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Centralized custody tracking for expired, damaged, and recalled pharmaceutical inventory. Manage certified destruction logistics, issue Certificates of Destruction, and process distributor waste returns with an immutable regulatory audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportComplianceCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Ledger</span>
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Logged in as <strong>{currentUser?.name}</strong> (Staff role). You have read-only view privileges. Approving disposal operations and issuing batch recalls require <strong>manufacturer_admin</strong> authorization.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nearing Expiry (&le; {currentTenantWasteConfig.nearExpiryThresholdDays}d)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{batchesNearExpiryCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Batches priority FEFO clearance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expired / Unsold Stock Value</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2">{formatCurrency(expiredStockValue)}</p>
          <p className="text-[11px] text-slate-500 mt-1">At manufacturing cost base</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Disposals</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{pendingDisposalsCount}</p>
          <p className="text-[11px] text-orange-700 font-medium mt-1">Scheduled or in transit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Destruction Certified</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-700 mt-2">{completedDisposalsCount}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1">Certificates attached to ledger</p>
        </div>
      </div>

      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
            activeTab === 'inventory'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>At-Risk & Expired Batches ({atRiskBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disposal_ops')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
            activeTab === 'disposal_ops'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Disposal Orders ({tenantWasteDisposalRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
            activeTab === 'returns'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Distributor Waste Returns</span>
          {pendingDistributorReturnsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {pendingDistributorReturnsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
            activeTab === 'compliance'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance Audit Ledger ({tenantComplianceLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
            activeTab === 'config'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Policy & Governance</span>
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine or batch number..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'near_expiry', 'expired_damaged', 'flagged_for_disposal', 'recalled'] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  onClick={() => setStatusFilter(filterVal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    statusFilter === filterVal
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filterVal.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Medicine & Formulation</th>
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Lifecycle State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No at-risk, near-expiry, or expired batches matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((item) => (
                    <tr key={item.batch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block text-sm">{item.medicineName}</span>
                        <span className="text-[11px] text-slate-500">{item.genericName} • {item.category}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900">{item.batch.batchNumber}</span>
                        <span className="text-[10px] text-slate-400 block">Mfg: {formatDate(item.batch.manufacturingDate)}</span>
                      </td>
                      <td className="p-4">
                        <span className="block font-medium text-slate-800">{formatDate(item.batch.expiryDate)}</span>
                        <span className={`text-[10px] font-bold ${item.expStatus.colorClass}`}>
                          {item.expStatus.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="block font-semibold text-slate-900">
                            Available: {item.batch.availableQuantity} {item.batch.packagingUnit}s
                          </span>
                          {(item.batch.flaggedQuantity || 0) > 0 && (
                            <span className="text-orange-700 font-bold block text-[11px]">
                              Flagged: {item.batch.flaggedQuantity} {item.batch.packagingUnit}s
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.batch.location === 'with_distributor' ? 'With Distributor' : 'Warehouse Quarantined'}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.computedStatus as any} size="sm" />
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {item.computedStatus !== 'recalled' && (
                          <button
                            onClick={() => handleOpenRecallModal(item)}
                            disabled={!isAdmin}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] transition-colors disabled:opacity-50"
                          >
                            Recall
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDisposalModal(item)}
                          disabled={!isAdmin}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-xs transition-colors disabled:opacity-50"
                        >
                          Raise Disposal
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredBatches.map((item) => (
              <div key={item.batch.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{item.medicineName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Batch: {item.batch.batchNumber}</span>
                  </div>
                  <StatusBadge status={item.computedStatus as any} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expiry</span>
                    <span className="font-semibold text-slate-800">{formatDate(item.batch.expiryDate)}</span>
                    <span className={`block font-bold text-[10px] ${item.expStatus.colorClass}`}>
                      {item.expStatus.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quantity</span>
                    <span className="font-bold text-slate-900">
                      {item.batch.availableQuantity > 0 ? item.batch.availableQuantity : item.batch.flaggedQuantity} {item.batch.packagingUnit}s
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {item.batch.location === 'with_distributor' ? 'With Distributor' : 'In Warehouse'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {item.computedStatus !== 'recalled' && (
                    <button
                      onClick={() => handleOpenRecallModal(item)}
                      disabled={!isAdmin}
                      className="flex-1 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs text-center disabled:opacity-50"
                    >
                      Recall Batch
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenDisposalModal(item)}
                    disabled={!isAdmin}
                    className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs text-center shadow-xs disabled:opacity-50"
                  >
                    Raise Disposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RAISE DISPOSAL */}
      {disposalModalBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Flame className="w-5 h-5" />
                <span>Raise Certified Bio-Medical Disposal Order</span>
              </div>
              <button onClick={() => setDisposalModalBatch(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block text-sm">{disposalModalBatch.medicineName}</span>
              <span className="font-mono">Batch #{disposalModalBatch.batch.batchNumber}</span> • Expiry: {formatDate(disposalModalBatch.batch.expiryDate)}
            </div>

            <form onSubmit={handleSubmitDisposal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Disposal Quantity ({disposalModalBatch.batch.packagingUnit}s)</label>
                <input
                  type="number"
                  min={1}
                  value={disposalQty}
                  onChange={(e) => setDisposalQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Waste Partner</label>
                <select
                  value={disposalPartnerId}
                  onChange={(e) => setDisposalPartnerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800"
                >
                  {tenantWastePartners.map((wp) => (
                    <option key={wp.id} value={wp.id}>
                      {wp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Pickup Date</label>
                  <input
                    type="date"
                    value={disposalDate}
                    onChange={(e) => setDisposalDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destruction Method</label>
                  <select
                    value={disposalMethod}
                    onChange={(e) => setDisposalMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="High-temp Incineration (1100°C)">High-temp Incineration</option>
                    <option value="Autoclaving & Shredding">Autoclaving & Shredding</option>
                    <option value="Chemical Inactivation">Chemical Inactivation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quarantine / Handling Notes</label>
                <textarea
                  rows={2}
                  value={disposalNotes}
                  onChange={(e) => setDisposalNotes(e.target.value)}
                  placeholder="Quarantine cage location, physical seal notes..."
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisposalModalBatch(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Confirm & Schedule Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CERTIFICATE UPLOAD */}
      {certModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <FileCheck2 className="w-5 h-5" />
                <span>Certificate of Destruction Upload</span>
              </div>
              <button onClick={() => setCertModalRequest(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
              <span className="font-bold block text-sm">Order #{certModalRequest.id}</span>
              <span>{certModalRequest.medicineName} • Batch #{certModalRequest.batchNumber}</span>
              <span className="block font-bold text-slate-800">Quantity: {certModalRequest.quantity} units</span>
            </div>

            <form onSubmit={handleSubmitCertificate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Certificate / Manifest Reference Number</label>
                <input
                  type="text"
                  value={certNumberInput}
                  onChange={(e) => setCertNumberInput(e.target.value)}
                  placeholder="e.g. COD-CPCB-2026-90412"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Signed Certificate File (Mock PDF Upload)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-700 font-semibold block">{mockFileName}</span>
                  <span className="text-[10px] text-slate-400">Verified digital stamp attached</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destruction Verification Notes</label>
                <textarea
                  rows={2}
                  value={certNotes}
                  onChange={(e) => setCertNotes(e.target.value)}
                  placeholder="Incineration temperature log, witness signature ID..."
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCertModalRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                >
                  Verify & Seal Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BATCH RECALL */}
      {recallModalBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Trigger Mandatory Batch Recall Alert</span>
              </div>
              <button onClick={() => setRecallModalBatch(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
              <span className="font-bold block text-sm">{recallModalBatch.medicineName}</span>
              <span className="font-mono font-bold">Batch Number: {recallModalBatch.batch.batchNumber}</span>
              <p className="text-[11px] text-red-800 mt-1">
                <strong>CRITICAL REGULATORY ACTION:</strong> Triggering a recall will mark this batch as <strong>RECALLED</strong> across all portals, zero out available inventory, and automatically generate mandatory Waste Return Requests for every distributor holding this batch in their historical orders.
              </p>
            </div>

            <form onSubmit={handleSubmitRecall} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Regulatory Reason for Recall</label>
                <textarea
                  rows={3}
                  value={recallReasonInput}
                  onChange={(e) => setRecallReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecallModalBatch(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
                >
                  Broadcast Recall Everywhere
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW RETURN */}
      {reviewReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <RotateCcw className="w-5 h-5" />
                <span>Review Distributor Waste Claim</span>
              </div>
              <button onClick={() => setReviewReturnModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-sm text-slate-900">{reviewReturnModal.medicineName}</span>
              <span className="font-mono text-slate-600 block">Batch: {reviewReturnModal.batchNumber}</span>
              <span className="font-semibold text-slate-800 block">
                Claimed: {reviewReturnModal.quantity} {reviewReturnModal.packagingUnit}s by {reviewReturnModal.distributorName}
              </span>
              <span className="text-[10px] text-amber-700 font-bold block">
                Reason: {reviewReturnModal.reason.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resolution Compensation Policy</label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="credit_note">Issue Credit Note to Distributor Account</option>
                  <option value="replace_stock">Replace Stock with Fresh Active Batch</option>
                  <option value="none_recall">Zero Compensation (Mandatory Recall / Handling Only)</option>
                </select>
              </div>

              {compensationType === 'credit_note' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Approved Credit Amount (₹)</label>
                  <input
                    type="number"
                    value={creditAmountInput}
                    onChange={(e) => setCreditAmountInput(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Manufacturer Notes to Distributor</label>
                <textarea
                  rows={2}
                  value={reviewDecisionNotes}
                  onChange={(e) => setReviewDecisionNotes(e.target.value)}
                  placeholder="Decision justification or return shipment pickup instructions..."
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSubmitReviewReturn('reject')}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                >
                  Reject Claim
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitReviewReturn('approve')}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                >
                  Approve & Settle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
