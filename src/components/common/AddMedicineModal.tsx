import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { MedicineCategory, ScheduleClassification } from '../../types';
import { PHARMACEUTICAL_PHOTO_PRESETS } from '../../utils/medicineVisuals';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Pill, 
  Check, 
  AlertCircle,
  Snowflake,
  ShieldCheck,
  Tag,
  Boxes,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose }) => {
  const { addNewMedicine, tenants, currentTenant, addToast } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('Analgesics & Antipyretics');
  const [packagingUnit, setPackagingUnit] = useState('strip');
  const [packSize, setPackSize] = useState('10 x 10 Tablets');
  const [mrp, setMrp] = useState<number>(150);
  const [ptrPrice, setPtrPrice] = useState<number>(105);
  const [minOrderQty, setMinOrderQty] = useState<number>(10);
  
  // Image State
  const [imageUrl, setImageUrl] = useState<string>(PHARMACEUTICAL_PHOTO_PRESETS[0].url);
  const [imageMode, setImageMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  
  // Batch State
  const [batchNumber, setBatchNumber] = useState(`BAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expDate, setExpDate] = useState('2028-06-30');
  const [initialQuantity, setInitialQuantity] = useState<number>(5000);
  
  // Regulatory State
  const [scheduleClassification, setScheduleClassification] = useState<ScheduleClassification>('Schedule H');
  const [rxRequired, setRxRequired] = useState(true);
  const [isColdChain, setIsColdChain] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(currentTenant?.id || 'mfg-acme');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const marginPercent = mrp > 0 ? Math.round(((mrp - ptrPrice) / mrp) * 100) : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File Type', 'Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'Please upload an image smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageUrl(dataUrl);
        addToast('success', 'Image Uploaded', 'Product packaging photo loaded successfully.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setImageUrl(customUrlInput.trim());
    addToast('success', 'Image URL Applied', 'External medicine packaging photo linked.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !genericName.trim()) {
      addToast('error', 'Required Fields Missing', 'Please provide Medicine Name and Generic Molecule.');
      return;
    }

    if (ptrPrice >= mrp) {
      addToast('warning', 'Price Warning', 'Wholesale PTR price should typically be lower than Maximum Retail Price (MRP).');
    }

    addNewMedicine({
      tenantId: selectedTenantId,
      name: name.trim(),
      genericName: genericName.trim(),
      brandName: brandName.trim() || name.trim(),
      category,
      packagingUnit,
      packSize: packSize.trim(),
      mrp: Number(mrp),
      ptrPrice: Number(ptrPrice),
      imageUrl: imageUrl || undefined,
      description: description.trim(),
      scheduleClassification,
      rxRequired,
      isColdChain,
      batchNumber: batchNumber.trim(),
      expDate,
      initialQuantity: Number(initialQuantity),
      minOrderQty: Number(minOrderQty),
    });

    onClose();
  };

  const categories: MedicineCategory[] = [
    'Analgesics & Antipyretics',
    'Antibiotics',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Antidiabetic',
    'Dermatological',
    'Nutritional & Vitamins',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A504C] to-[#123E3A] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Pill className="w-5 h-5 text-[#4BE1E4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl tracking-tight">
                  Add New Medicine & Picture
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#4BE1E4] text-[#0A2624] font-black text-[10px] uppercase">
                  B2B Live
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Register a verified formulation with packaging photo, wholesale PTR, and live FEFO batch stock.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* 1. Medicine Picture Upload & Preview Stage */}
          <div className="bg-[#F5F8F6] p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-heading font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1A504C]" />
                <span>Medicine Packaging Photo / Picture</span>
              </label>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('presets')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    imageMode === 'presets' ? 'bg-[#1A504C] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  Preset Photos
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    imageMode === 'upload' ? 'bg-[#1A504C] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    imageMode === 'url' ? 'bg-[#1A504C] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Left: Active Live Image Preview */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="w-full h-36 rounded-2xl bg-white border border-gray-200 shadow-2xs overflow-hidden relative flex items-center justify-center group">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Medicine preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="text-center p-3 text-[#9CA3AF]">
                      <Pill className="w-8 h-8 mx-auto stroke-[1.5] mb-1" />
                      <span className="text-[10px] font-bold block">No Image Selected</span>
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-black uppercase">
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Right: Controls based on Image Mode */}
              <div className="sm:col-span-8">
                {imageMode === 'presets' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#6B7280] block">
                      Choose from 1-Click Realistic Packaging Photos:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {PHARMACEUTICAL_PHOTO_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setImageUrl(p.url)}
                          className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                            imageUrl === p.url ? 'border-[#1A504C] ring-2 ring-[#1A504C]/30' : 'border-gray-200 hover:border-[#1A504C]/50'
                          }`}
                          title={p.name}
                        >
                          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          {imageUrl === p.url && (
                            <div className="absolute inset-0 bg-[#1A504C]/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {imageMode === 'upload' && (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#1A504C] rounded-2xl p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-7 h-7 text-[#1A504C] mx-auto mb-1" />
                      <span className="font-heading font-black text-xs text-[#1A1A1A] block">
                        Click to browse or drop medicine photo
                      </span>
                      <span className="text-[10px] text-[#6B7280] block mt-0.5">
                        PNG, JPG, WebP up to 4MB
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {imageMode === 'url' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#6B7280] block">
                      Paste direct web URL to pharmaceutical packaging:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://example.com/medicine-pack.jpg"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1A504C]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        className="px-3.5 py-2 rounded-xl bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Medicine Identity Fields */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#1A504C]" />
              <span>Medicine Identity & Molecule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Product Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol Tablets IP 650mg"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A504C] focus:ring-2 focus:ring-[#1A504C]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Active Molecule / Generic Name *
                </label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Paracetamol (Acetaminophen)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A504C] focus:ring-2 focus:ring-[#1A504C]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Therapeutic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A504C]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Manufacturing Principal
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A504C]"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Packaging Unit
                </label>
                <select
                  value={packagingUnit}
                  onChange={(e) => setPackagingUnit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A504C]"
                >
                  <option value="strip">Strip (Tablets / Capsules)</option>
                  <option value="box">Box (Outer Pack)</option>
                  <option value="bottle">Bottle (Syrup / Liquid)</option>
                  <option value="vial">Vial (Injection)</option>
                  <option value="ampoule">Ampoule</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Pack Size Specification
                </label>
                <input
                  type="text"
                  value={packSize}
                  onChange={(e) => setPackSize(e.target.value)}
                  placeholder="e.g. 10 x 10 Tablets or 100ml"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
                />
              </div>
            </div>
          </div>

          {/* 3. Commercial Wholesale Rates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#1A504C]" />
                <span>Commercial Pricing & Margins</span>
              </h3>
              {marginPercent > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F3F1] text-[#1A504C] font-black text-[10px] uppercase">
                  {marginPercent}% Wholesale Distributor Margin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Maximum Retail Price (MRP ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mrp}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMrp(val);
                      if (ptrPrice >= val) setPtrPrice(Math.round(val * 0.7));
                    }}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#1A504C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Wholesale PTR Rate (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ptrPrice}
                    onChange={(e) => setPtrPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#1A504C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#1A504C]"
                />
              </div>
            </div>
          </div>

          {/* 4. Initial Live Batch Stocking */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-[#1A504C]" />
              <span>Initial FEFO Batch Stocking</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Initial Batch No. *
                </label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Initial Units Available
                </label>
                <input
                  type="number"
                  min="10"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A504C]"
                />
              </div>
            </div>
          </div>

          {/* 5. Regulatory & Storage Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <h4 className="font-heading font-black text-xs text-[#1A1A1A] uppercase tracking-wider">
              Regulatory Compliance & Cold-Chain Flag
            </h4>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rxRequired}
                  onChange={(e) => setRxRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A504C] focus:ring-[#1A504C]"
                />
                <span className="font-bold text-[#1A1A1A]">Prescription Required (Rx)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isColdChain}
                  onChange={(e) => setIsColdChain(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
                />
                <span className="font-bold text-blue-800 flex items-center gap-1">
                  <Snowflake className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cold-Chain Telemetry (2°C–8°C)</span>
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#4B5563]">Schedule:</span>
                <select
                  value={scheduleClassification}
                  onChange={(e) => setScheduleClassification(e.target.value as ScheduleClassification)}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white font-bold text-xs"
                >
                  <option value="OTC">OTC (Over The Counter)</option>
                  <option value="Schedule H">Schedule H</option>
                  <option value="Schedule H1">Schedule H1</option>
                  <option value="Schedule X">Schedule X</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-[#6B7280] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Publish Formulation to Marketplace</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
