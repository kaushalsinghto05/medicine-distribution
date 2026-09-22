import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Medicine, Batch, ScheduleClassification, MedicineCategory } from '../../../types';
import { formatCurrency, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { getMedicineVisual } from '../../../utils/medicineVisuals';
import {
  Plus,
  Pill,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CatalogScreen: React.FC = () => {
  const {
    currentTenant,
    tenantMedicines,
    createMedicine,
    addBatch,
    publishMedicine,
    addToast,
    setIsAddMedicineModalOpen,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedMedicineId, setExpandedMedicineId] = useState<string | null>(null);

  // Modals state
  const [isCreateMedicineOpen, setIsCreateMedicineOpen] = useState(false);
  const [addBatchMedicine, setAddBatchMedicine] = useState<Medicine | null>(null);
  const [publishTargetMedicine, setPublishTargetMedicine] = useState<Medicine | null>(null);

  // New Medicine Form State
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newCategory, setNewCategory] = useState<MedicineCategory>('Analgesics & Antipyretics');
  const [newPackagingUnit, setNewPackagingUnit] = useState('strip');
  const [newPackSize, setNewPackSize] = useState('10 x 10 Tablets');
  const [newMrp, setNewMrp] = useState<number>(100);
  const [newDescription, setNewDescription] = useState('');
  const [newSchedule, setNewSchedule] = useState<ScheduleClassification>('Schedule H');
  const [newComposition, setNewComposition] = useState('');
  const [newStorage, setNewStorage] = useState('Store below 25°C in a dry place');
  const [newRxRequired, setNewRxRequired] = useState(true);
  const [newIsRestricted, setNewIsRestricted] = useState(false);
  const [newIsColdChain, setNewIsColdChain] = useState(false);

  // Add Batch Form State
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newBatchMfgDate, setNewBatchMfgDate] = useState('2026-03-01');
  const [newBatchExpDate, setNewBatchExpDate] = useState('2028-02-28');
  const [newBatchQuantity, setNewBatchQuantity] = useState<number>(5000);
  const [newBatchMrp, setNewBatchMrp] = useState<number>(100);

  const categories = [
    'All',
    'Antibiotics',
    'Analgesics & Antipyretics',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Antidiabetic',
    'Dermatological',
    'Nutritional & Vitamins',
  ];

  const filteredMedicines = tenantMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newGenericName.trim()) {
      addToast('error', 'Validation Error', 'Medicine Name and Generic Name are required.');
      return;
    }

    createMedicine({
      tenantId: currentTenant.id,
      name: newMedName,
      genericName: newGenericName,
      brandName: newBrandName || newMedName,
      category: newCategory,
      packagingUnit: newPackagingUnit,
      packSize: newPackSize,
      mrp: newMrp,
      description: newDescription,
      status: 'draft',
      regulatory: {
        scheduleClassification: newSchedule,
        rxRequired: newRxRequired,
        drugLicenseNumber: currentTenant.drugLicenseNumber,
        composition: newComposition || `${newGenericName} standard formulation`,
        storageConditions: newStorage,
        isColdChain: newIsColdChain,
        isRestrictedSale: newIsRestricted,
        standardPackagingUnit: newPackagingUnit,
      },
      batches: [],
      pricing: {
        medicineId: '',
        tenantId: currentTenant.id,
        standardDistributorPrice: Math.round(newMrp * 0.7), // default 30% margin
        distributorOverrides: {},
        slabs: [],
        discounts: [],
      },
      rules: {
        medicineId: '',
        tenantId: currentTenant.id,
        minOrderQty: 10,
        orderMultiple: 10,
        maxOrderQty: 500,
        maxDistributorCap: 2000,
        dailyLimit: 500,
        weeklyLimit: 1000,
        monthlyLimit: 2000,
        shortageBehavior: 'reject',
        distributorEligibility: {
          approvalRequired: true,
          licenseVerifiedRequired: true,
          activeAccountOnly: true,
          restrictedScheduleAllowed: false,
        },
        applicablePaymentTerms: ['online', 'credit'],
        creditTermsDays: 30,
      },
    });

    setIsCreateMedicineOpen(false);
    // Reset form
    setNewMedName('');
    setNewGenericName('');
    setNewBrandName('');
    setNewDescription('');
  };

  const handleAddBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBatchMedicine) return;
    if (!newBatchNumber.trim()) {
      addToast('error', 'Batch Number Missing', 'Please provide a unique batch identifier.');
      return;
    }

    addBatch(addBatchMedicine.id, {
      batchNumber: newBatchNumber.toUpperCase(),
      manufacturingDate: newBatchMfgDate,
      expiryDate: newBatchExpDate,
      initialQuantity: newBatchQuantity,
      availableQuantity: newBatchQuantity,
      packagingUnit: addBatchMedicine.packagingUnit,
      mrp: newBatchMrp || addBatchMedicine.mrp,
      costPrice: Math.round((newBatchMrp || addBatchMedicine.mrp) * 0.45),
    });

    setAddBatchMedicine(null);
    setNewBatchNumber('');
  };

  const executePublish = () => {
    if (!publishTargetMedicine) return;
    const res = publishMedicine(publishTargetMedicine.id);
    if (res.success) {
      setPublishTargetMedicine(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-slate-900">Medicine Catalog Management</h1>
          <p className="text-xs text-slate-500">
            Configure pharmaceutical formulations, active FEFO batches, regulatory compliance, and publish status for {currentTenant.shortName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsAddMedicineModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            title="Add a new pharmaceutical product with real packaging photo, FEFO batch, and wholesale PTR rate"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Medicine & Picture</span>
          </button>

          <button
            onClick={() => setIsCreateMedicineOpen(true)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-none transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Formulation</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-none flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine by brand name, generic molecule..."
            className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table (Desktop) / Card List (Mobile) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-none overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Category & Schedule</th>
                <th className="py-3 px-4">Packaging & MRP</th>
                <th className="py-3 px-4">Distributor Price</th>
                <th className="py-3 px-4">Batches & Total Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMedicines.map((med) => {
                const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
                const isExpanded = expandedMedicineId === med.id;
                const visual = getMedicineVisual(med);

                return (
                  <React.Fragment key={med.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-9 h-9 rounded-lg ${visual.bgColor} border ${visual.borderColor} flex items-center justify-center shrink-0 overflow-hidden shadow-2xs`}>
                            {med.imageUrl ? (
                              <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className={`text-xs font-extrabold ${visual.textColor}`}>{visual.monogram}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-slate-900 text-sm">{med.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Generic: {med.genericName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Pack: {med.packSize}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-800 block">{med.category}</span>
                        <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {med.regulatory.scheduleClassification}
                        </span>
                        {med.regulatory.rxRequired && (
                          <span className="ml-1 text-[10px] font-bold text-rose-600">Rx</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{formatCurrency(med.mrp)}</div>
                        <div className="text-[11px] text-slate-500">per {med.packagingUnit}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-sky-700">
                          {formatCurrency(med.pricing.standardDistributorPrice)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Margin: {med.mrp > 0 ? Math.round(((med.mrp - med.pricing.standardDistributorPrice) / med.mrp) * 100) : 0}%
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{totalStock.toLocaleString()}</span>
                          <span className="text-slate-500">{med.packagingUnit}s</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {med.batches.length} batch(es) active
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={med.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAddBatchMedicine(med);
                              setNewBatchMrp(med.mrp);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Add inventory batch"
                          >
                            + Add Batch
                          </button>

                          {med.status === 'draft' ? (
                            <button
                              onClick={() => setPublishTargetMedicine(med)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                            >
                              Publish
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 rounded-lg">
                              Live
                            </span>
                          )}

                          <button
                            onClick={() => setExpandedMedicineId(isExpanded ? null : med.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Inspect Batches & Rules"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Batches & Rules Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="p-4">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-sky-600" />
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  Batches & FEFO Order Priority
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                First-Expiry-First-Out (FEFO) automated allocation applies at checkout.
                              </span>
                            </div>

                            {med.batches.length === 0 ? (
                              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                No batches added yet. Click "+ Add Batch" above to add manufacturing lots before publishing.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                                    <tr>
                                      <th className="py-2 px-3 text-left">FEFO Rank</th>
                                      <th className="py-2 px-3 text-left">Batch No.</th>
                                      <th className="py-2 px-3 text-left">Mfg Date</th>
                                      <th className="py-2 px-3 text-left">Expiry Date</th>
                                      <th className="py-2 px-3 text-left">Expiry Status</th>
                                      <th className="py-2 px-3 text-left">Stock Available</th>
                                      <th className="py-2 px-3 text-left">Batch MRP</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {[...med.batches]
                                      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                                      .map((b, idx) => {
                                        const expiryStatus = getExpiryStatus(b.expiryDate);

                                        return (
                                          <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3">
                                              <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                                                #{idx + 1} FEFO
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                              {b.batchNumber}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600">
                                              {formatDate(b.manufacturingDate)}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                                              {formatDate(b.expiryDate)}
                                            </td>
                                            <td className="py-2.5 px-3">
                                              <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] border ${expiryStatus.bgClass}`}
                                              >
                                                {expiryStatus.label}
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-slate-900">
                                              {b.availableQuantity.toLocaleString()} {b.packagingUnit}s
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700">
                                              {formatCurrency(b.mrp)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Ordering Rules Brief */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                              <div>
                                <span className="font-semibold text-slate-800">Configured Policy: </span>
                                MOQ: {med.rules.minOrderQty} | Multiples: {med.rules.orderMultiple} | Max/Order:{' '}
                                {med.rules.maxOrderQty} | Monthly Limit: {med.rules.monthlyLimit} | Shortage:{' '}
                                <span className="font-semibold uppercase text-slate-800">
                                  {med.rules.shortageBehavior}
                                </span>
                              </div>
                              <span className="text-[11px] text-sky-600 font-semibold">
                                Edit in Rules Engine tab →
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (<1024px) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredMedicines.map((med) => {
            const totalStock = med.batches.reduce((sum, b) => sum + b.availableQuantity, 0);

            return (
              <div key={med.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{med.name}</h3>
                    <p className="text-xs text-slate-500">{med.genericName}</p>
                  </div>
                  <StatusBadge status={med.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">MRP vs Price</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(med.mrp)} / {formatCurrency(med.pricing.standardDistributorPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Stock Available</span>
                    <span className="font-bold text-sky-700">
                      {totalStock.toLocaleString()} {med.packagingUnit}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    {med.regulatory.scheduleClassification}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAddBatchMedicine(med);
                        setNewBatchMrp(med.mrp);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
                    >
                      + Batch
                    </button>
                    {med.status === 'draft' && (
                      <button
                        onClick={() => setPublishTargetMedicine(med)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE MEDICINE FORM MODAL */}
      {isCreateMedicineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h2 className="text-lg font-bold text-slate-900">Create Medicine Formulation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter brand details and Indian regulatory compliance attributes.
            </p>

            <form onSubmit={handleCreateMedicineSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medicine Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Acme Cefixime 200mg"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Generic Active Molecule <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                    placeholder="e.g. Cefixime Trihydrate IP"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Therapeutic Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MedicineCategory)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Dermatological">Dermatological</option>
                    <option value="Nutritional & Vitamins">Nutritional & Vitamins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Unit</label>
                  <select
                    value={newPackagingUnit}
                    onChange={(e) => setNewPackagingUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="strip">strip</option>
                    <option value="box">box</option>
                    <option value="vial">vial</option>
                    <option value="ampoule">ampoule</option>
                    <option value="bottle">bottle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Retail Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMrp}
                    onChange={(e) => setNewMrp(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Regulatory & Compliance Section (Section 9) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Indian Regulatory Compliance (Drugs & Cosmetics Act)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Schedule Classification
                    </label>
                    <select
                      value={newSchedule}
                      onChange={(e) => setNewSchedule(e.target.value as ScheduleClassification)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="OTC">OTC (Over the Counter)</option>
                      <option value="Schedule H">Schedule H (Prescription Only)</option>
                      <option value="Schedule H1">Schedule H1 (High Risk Antibiotic / Psychotropic)</option>
                      <option value="Schedule X">Schedule X (Strict Narcotics / Barbiturates)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Conditions</label>
                    <input
                      type="text"
                      value={newStorage}
                      onChange={(e) => setNewStorage(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRxRequired}
                      onChange={(e) => setNewRxRequired(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Prescription (Rx) Required</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsRestricted}
                      onChange={(e) => setNewIsRestricted(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Restricted Sale Flag</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsColdChain}
                      onChange={(e) => setNewIsColdChain(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Cold Chain (2°C - 8°C)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Indications</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Primary clinical indications, dosage formulation..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateMedicineOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  Save as Draft Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BATCH MODAL */}
      {addBatchMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Add Production Batch</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulation: <span className="font-semibold text-slate-800">{addBatchMedicine.name}</span>
            </p>

            <form onSubmit={handleAddBatchSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Number / Lot ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  placeholder="e.g. PCM2026C"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    required
                    value={newBatchMfgDate}
                    onChange={(e) => setNewBatchMfgDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newBatchExpDate}
                    onChange={(e) => setNewBatchExpDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity ({addBatchMedicine.packagingUnit}s)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchQuantity}
                    onChange={(e) => setNewBatchQuantity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchMrp}
                    onChange={(e) => setNewBatchMrp(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddBatchMedicine(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  Add Batch & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH CHECKLIST CONFIRMATION MODAL */}
      {publishTargetMedicine && (
        <ConfirmationModal
          isOpen={Boolean(publishTargetMedicine)}
          title={`Publish ${publishTargetMedicine.name}?`}
          description="Publishing will immediately make this medicine visible and purchasable to all authorized distributors within your tenant network."
          confirmLabel="Authorize & Publish"
          variant="success"
          checklistItems={[
            {
              label: 'Production batch added with valid expiry date',
              passed: publishTargetMedicine.batches.length > 0,
            },
            {
              label: `Standard distributor price configured (₹${publishTargetMedicine.pricing.standardDistributorPrice})`,
              passed: publishTargetMedicine.pricing.standardDistributorPrice > 0,
            },
            {
              label: `Ordering rules configured (MOQ: ${publishTargetMedicine.rules.minOrderQty})`,
              passed: publishTargetMedicine.rules.minOrderQty > 0,
            },
          ]}
          onConfirm={executePublish}
          onCancel={() => setPublishTargetMedicine(null)}
        />
      )}
    </div>
  );
};
