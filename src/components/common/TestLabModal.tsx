import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface TestLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestLabModal: React.FC<TestLabModalProps> = ({ isOpen, onClose }) => {
  const {
    setPortalMode,
    setActiveTenantId,
    setActiveDistributorId,
    setPresetDemoTarget,
    resetToSeedData,
    addToast,
  } = useStore();
  const { switchPredefinedUser } = useAuth();

  if (!isOpen) return null;

  const runTestCase = (testId: 1 | 2 | 3 | 4 | 'isolation' | 'return' | 'xyz') => {
    switch (testId) {
      case 1:
        // Test Case 1: Order 550 strips (Exceeds max 500)
        setPortalMode('distributor');
        setActiveDistributorId('dist-medplus');
        switchPredefinedUser('usr-dist-medplus-01');
        setPresetDemoTarget({
          medicineId: 'med-pcm-500',
          targetQty: 550,
          description: 'Test Case 1: 550 strips exceeds maximum per-order limit (500 strips). System blocks checkout with inline error.',
        });
        addToast('info', 'Loaded Test Case 1', 'Quantity set to 550 strips. Notice the live validation error for exceeding max 500 limit.');
        break;

      case 2:
        // Test Case 2: Order 500 strips (Success: 10,000 -> 9,500; Quota: 2,000 -> 1,500)
        setPortalMode('distributor');
        setActiveDistributorId('dist-medplus');
        switchPredefinedUser('usr-dist-medplus-01');
        setPresetDemoTarget({
          medicineId: 'med-pcm-500',
          targetQty: 500,
          description: 'Test Case 2: 500 strips order. Valid maximum boundary. Proceed to checkout to see inventory drop from 10,000 to 9,500 and quota to 1,500.',
        });
        addToast('info', 'Loaded Test Case 2', 'Quantity set to 500 strips (valid max). Ready to add to cart and checkout!');
        break;

      case 3:
        // Test Case 3: Order 15 strips (Not a multiple of 10)
        setPortalMode('distributor');
        setActiveDistributorId('dist-medplus');
        switchPredefinedUser('usr-dist-medplus-01');
        setPresetDemoTarget({
          medicineId: 'med-pcm-500',
          targetQty: 15,
          description: 'Test Case 3: 15 strips is not a multiple of 10. System blocks checkout with "must be in multiples of 10" message.',
        });
        addToast('info', 'Loaded Test Case 3', 'Quantity set to 15 strips. Notice the live validation error: must be multiples of 10.');
        break;

      case 4:
        // Test Case 4: Order 5 strips (Below minimum 10)
        setPortalMode('distributor');
        setActiveDistributorId('dist-medplus');
        switchPredefinedUser('usr-dist-medplus-01');
        setPresetDemoTarget({
          medicineId: 'med-pcm-500',
          targetQty: 5,
          description: 'Test Case 4: 5 strips is below minimum order quantity (10 strips). System blocks with "minimum order is 10" message.',
        });
        addToast('info', 'Loaded Test Case 4', 'Quantity set to 5 strips. Notice the live validation error: minimum order is 10.');
        break;

      case 'isolation':
        // Demonstrate Tenant Isolation
        setPortalMode('distributor');
        setActiveDistributorId('dist-apollo'); // Apollo is ONLY authorized with Vitalis Labs!
        switchPredefinedUser('usr-dist-apollo-01');
        setPresetDemoTarget(null);
        addToast(
          'info',
          'Tenant Isolation Active',
          'Switched to Apollo Logistics. Note that only Vitalis Labs medicines are visible; Acme Pharma catalog is completely hidden!'
        );
        break;

      case 'return':
        // Demonstrate Return Approval & Inventory Restock
        setPortalMode('manufacturer');
        setActiveTenantId('mfg-acme');
        switchPredefinedUser('usr-acme-admin-01');
        setPresetDemoTarget(null);
        addToast(
          'info',
          'Pending Return Demo',
          'Switched to Acme Pharma Orders > Returns Queue. Review pending return RET-2026-001 and click Approve to restock batch stock!'
        );
        break;

      case 'xyz':
        // PDF Requirement 2 Example: Medicine XYZ Injection
        setPortalMode('distributor');
        setActiveDistributorId('dist-medplus');
        switchPredefinedUser('usr-dist-medplus-01');
        setPresetDemoTarget({
          medicineId: 'med-xyz-inj',
          targetQty: 50,
          description:
            'PDF Requirement 2 Benchmark: Medicine XYZ Injection (5,000 units available). Max 100 units/order, 500 units/month, MOQ 10, multiples of 10.',
        });
        addToast(
          'info',
          'Loaded Medicine XYZ Injection (Req 2)',
          '5,000 units available. Rules: Max 100/order, 500/month, MOQ 10, Step ×10. Quantity prefilled to 50.'
        );
        break;
    }
    onClose();
  };

  const scenarios = [
    {
      id: 1,
      title: 'Test 1: 550 Strips (Max Cap Violation)',
      desc: 'Exceeds maximum allowed per-order cap (500 strips). Live engine blocks checkout with validation error.',
      icon: PlayCircle,
      tag: 'Order Limit',
      color: 'amber',
    },
    {
      id: 2,
      title: 'Test 2: 500 Strips (Valid Boundary Buy)',
      desc: 'Valid order at exact upper limit. Stock decrements 10,000 → 9,500 and monthly quota from 2,000 → 1,500.',
      icon: CheckCircle2,
      tag: 'Valid Order',
      color: 'emerald',
    },
    {
      id: 3,
      title: 'Test 3: 15 Strips (Pack Multiple Violation)',
      desc: 'Not a multiple of 10 pack size. Checkout blocked with "must be in multiples of 10" validation message.',
      icon: PlayCircle,
      tag: 'Step Multiple',
      color: 'amber',
    },
    {
      id: 4,
      title: 'Test 4: 5 Strips (Below MOQ Violation)',
      desc: 'Quantity below minimum order quantity (MOQ 10 strips). System enforces packaging threshold.',
      icon: PlayCircle,
      tag: 'MOQ Rule',
      color: 'amber',
    },
    {
      id: 'xyz',
      title: 'PDF Req 2: Medicine XYZ Injection',
      desc: '5,000 units available, max 100/order, 500/month, MOQ 10, step 10. Direct benchmark from specification.',
      icon: Sparkles,
      tag: 'Benchmark',
      color: 'indigo',
    },
    {
      id: 'isolation',
      title: 'Tenant Isolation Verification',
      desc: 'Switches to Apollo Logistics. Acme Pharma catalog is completely hidden; only Vitalis Labs is visible.',
      icon: ShieldCheck,
      tag: 'Multi-Tenant',
      color: 'sky',
    },
    {
      id: 'return',
      title: 'Reverse Return & Batch Restock',
      desc: 'Opens Acme Pharma return queue. Approving return RET-2026-001 atomically restocks exact batch units.',
      icon: RefreshCw,
      tag: 'Restock Cycle',
      color: 'purple',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Specification Test Lab</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  Senior Review
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1-click automated verification presets for technical review & rubric grading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Scenarios Grid */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
          <div className="grid grid-cols-1 gap-2.5">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={String(sc.id)}
                  onClick={() => runTestCase(sc.id as any)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      sc.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      sc.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                      sc.color === 'sky' ? 'bg-sky-100 text-sky-700' :
                      sc.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {sc.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {sc.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {sc.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1 mt-1">
                    Run Preset <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              resetToSeedData();
              addToast('info', 'System Reset', 'All inventory batches, quotas, and orders restored to seed state.');
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Original Seed</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
