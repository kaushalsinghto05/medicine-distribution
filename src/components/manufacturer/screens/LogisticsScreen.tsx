import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Truck, Plus, Phone, Mail, MapPin } from 'lucide-react';

export const LogisticsScreen: React.FC = () => {
  const { currentTenant, tenantLogisticsPartners, addLogisticsPartner } = useStore();

  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCoverage, setNewCoverage] = useState('Pan-India Cold Chain & Express');

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addLogisticsPartner({
      name: newName,
      contactPerson: newContact,
      phone: newPhone,
      email: newEmail,
      coverageArea: newCoverage,
      active: true,
    });

    setIsAddPartnerOpen(false);
    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fulfilment & Logistics Partners</h1>
          <p className="text-xs text-slate-500">
            Configure pharmaceutical freight carriers, specialized cold-chain couriers, and dispatch dispatchers for {currentTenant.shortName}.
          </p>
        </div>

        <button
          onClick={() => setIsAddPartnerOpen(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Carrier Partner
        </button>
      </div>

      {/* Carrier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tenantLogisticsPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Truck className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active Partner
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{partner.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {partner.coverageArea}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CARRIER MODAL */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Carrier Partner</h2>

            <form onSubmit={handleAddPartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Carrier Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. SafeExpress Pharma Logistics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coverage Area</label>
                <input
                  type="text"
                  required
                  value={newCoverage}
                  onChange={(e) => setNewCoverage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 22 1234 5678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ops@carrier.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  Save Carrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
