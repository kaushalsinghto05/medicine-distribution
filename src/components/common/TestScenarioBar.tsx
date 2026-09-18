import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const TestScenarioBar: React.FC = () => {
  const [isBarVisible, setIsBarVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    setPortalMode,
    setActiveTenantId,
    setActiveDistributorId,
    setPresetDemoTarget,
    resetToSeedData,
    addToast,
  } = useStore();
  const { switchPredefinedUser } = useAuth();

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
        // PDF Requirement 2 Example: Medicine XYZ Injection (5,000 units, max 100/order, 500/month, MOQ 10, multiple 10)
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
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border-b border-sky-800/40 text-xs">
      {!isBarVisible ? (
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
          <button
            onClick={() => setIsBarVisible(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 hover:text-sky-300 py-0.5"
          >
            <Sparkles className="w-3 h-3" />
            <span>Show Quick Test Lab Presets (Specs Review)</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/30">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Quick Test Lab
              </span>
              <span className="hidden sm:inline text-slate-300">
                Interactive verification presets for specification review
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => runTestCase(1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Test Case 1: 550 strips (Exceeds 500 max/order)"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                Test 1: 550 Strips (Max Cap)
              </button>

              <button
                onClick={() => runTestCase(2)}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Test Case 2: 500 strips valid order (10,000 -> 9,500 stock, quota 2,000 -> 1,500)"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Test 2: 500 Strips (Valid Buy)
              </button>

              <button
                onClick={() => runTestCase(3)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Test Case 3: 15 strips (Not multiple of 10)"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                Test 3: 15 Strips (Multiples)
              </button>

              <button
                onClick={() => runTestCase(4)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Test Case 4: 5 strips (Below 10 MOQ)"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                Test 4: 5 Strips (MOQ)
              </button>

              <button
                onClick={() => runTestCase('xyz')}
                className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="PDF Requirement 2: Medicine XYZ Injection (5,000 units, max 100/order, 500/month, MOQ 10, multiple 10)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                XYZ Injection (Req 2)
              </button>

              <button
                onClick={() => runTestCase('isolation')}
                className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/60 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Verify Acme vs Vitalis catalog scoping"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Tenant Isolation
              </button>

              <button
                onClick={() => runTestCase('return')}
                className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 font-medium transition-colors hover:text-white flex items-center gap-1"
                title="Review pending return & restock batch"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                Return & Restock
              </button>

              <button
                onClick={resetToSeedData}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
                title="Reset system state to original baseline"
              >
                Reset Seed Data
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Toggle details"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsBarVisible(false)}
                className="p-1 text-slate-400 hover:text-rose-400 ml-0.5"
                title="Collapse Test Bar"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="max-w-7xl mx-auto px-4 py-3 bg-slate-950/80 border-t border-sky-900/50 text-slate-300 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-sky-400 block mb-1">Acme Pharma Reference Rules</span>
                <p>Paracetamol 500mg (PCM2026A): 10,000 initial strips. MOQ: 10, Multiples: 10, Max: 500, Monthly Limit: 2,000. Shortage: Reject.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">Strict Multi-Tenant Scoping</span>
                <p>MedPlus authorized with Acme ONLY. Apollo authorized with Vitalis ONLY. CarePoint authorized with BOTH. Nova is Pending.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-purple-400 block mb-1">Zero-Negative & Return Restock</span>
                <p>Orders atomically decrement batch stock. Approved returns automatically re-credit batch quantity and write audit logs.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
