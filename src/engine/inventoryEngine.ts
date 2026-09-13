import { Batch, Medicine, OrderItem, ReturnRequest, AuditTrailEntry } from '../types';

/**
 * First-Expiry-First-Out (FEFO) Comparator
 * Prioritizes batches expiring soonest that still have available quantity.
 */
export function sortBatchesFEFO(batches: Batch[]): Batch[] {
  return [...batches].sort((a, b) => {
    // Both have stock or both empty: compare expiry date
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    return dateA - dateB;
  });
}

export interface InventoryAllocationResult {
  allocations: {
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    allocatedQty: number;
    backorderedQty: number;
    shortageStatus: 'full' | 'partial' | 'backorder';
  }[];
  totalFulfilled: number;
  totalBackordered: number;
  unfulfilled: number;
}

/**
 * Allocates requested medicine quantity against batches according to FEFO logic
 * and shortage policy.
 */
export function allocateInventoryFEFO(
  medicine: Medicine,
  requestedQuantity: number
): InventoryAllocationResult {
  const fefoBatches = sortBatchesFEFO(medicine.batches.filter((b) => b.availableQuantity > 0));
  const allocations: InventoryAllocationResult['allocations'] = [];
  let remainingToAllocate = requestedQuantity;

  for (const batch of fefoBatches) {
    if (remainingToAllocate <= 0) break;

    const allocatable = Math.min(batch.availableQuantity, remainingToAllocate);
    if (allocatable > 0) {
      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        allocatedQty: allocatable,
        backorderedQty: 0,
        shortageStatus: 'full',
      });
      remainingToAllocate -= allocatable;
    }
  }

  const totalFulfilled = requestedQuantity - remainingToAllocate;
  let totalBackordered = 0;
  let unfulfilled = 0;

  if (remainingToAllocate > 0) {
    if (medicine.rules.shortageBehavior === 'backorder') {
      totalBackordered = remainingToAllocate;
      // Mark or attach backorder allocation
      allocations.push({
        batchId: fefoBatches[0]?.id || 'backorder-pending',
        batchNumber: fefoBatches[0]?.batchNumber || 'TBD (Backorder)',
        expiryDate: fefoBatches[0]?.expiryDate || 'Future Production',
        allocatedQty: 0,
        backorderedQty: remainingToAllocate,
        shortageStatus: 'backorder',
      });
    } else if (medicine.rules.shortageBehavior === 'partial') {
      unfulfilled = remainingToAllocate;
      if (allocations.length > 0) {
        allocations[allocations.length - 1].shortageStatus = 'partial';
      }
    } else {
      // Reject behavior
      unfulfilled = remainingToAllocate;
    }
  }

  return {
    allocations,
    totalFulfilled,
    totalBackordered,
    unfulfilled,
  };
}

/**
 * Deduct inventory for confirmed order items from batches
 * Guarantees available stock never drops below zero.
 */
export function deductBatchInventory(
  medicines: Medicine[],
  orderItems: OrderItem[],
  orderNumber: string,
  actor: string = 'Distributor Checkout'
): { updatedMedicines: Medicine[]; auditLogs: AuditTrailEntry[] } {
  const auditLogs: AuditTrailEntry[] = [];
  const updatedMedicines = medicines.map((med) => {
    const relevantItems = orderItems.filter((item) => item.medicineId === med.id);
    if (relevantItems.length === 0) return med;

    let updatedBatches = [...med.batches];

    for (const item of relevantItems) {
      const batchIndex = updatedBatches.findIndex((b) => b.id === item.batchId);
      if (batchIndex !== -1) {
        const currentBatch = updatedBatches[batchIndex];
        const newAvailable = Math.max(0, currentBatch.availableQuantity - item.fulfilledQuantity);
        
        updatedBatches[batchIndex] = {
          ...currentBatch,
          availableQuantity: newAvailable,
        };

        auditLogs.push({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          action: 'INVENTORY_DEDUCTION',
          details: `Deducted ${item.fulfilledQuantity} ${item.packagingUnit}s for Order ${orderNumber}. Stock changed from ${currentBatch.availableQuantity} to ${newAvailable} (Batch ${currentBatch.batchNumber}).`,
          actor,
          batchId: currentBatch.id,
          quantityDelta: -item.fulfilledQuantity,
        });
      }
    }

    return {
      ...med,
      batches: updatedBatches,
    };
  });

  return { updatedMedicines, auditLogs };
}

/**
 * Restores inventory when a return or cancellation request is approved by the manufacturer.
 * Traceable back to the specific batch and order.
 */
export function restockBatchInventory(
  medicines: Medicine[],
  returnRequest: ReturnRequest,
  actor: string = 'Manufacturer Admin'
): { updatedMedicines: Medicine[]; auditLogs: AuditTrailEntry[] } {
  const auditLogs: AuditTrailEntry[] = [];

  const updatedMedicines = medicines.map((med) => {
    const relevantItems = returnRequest.items.filter((item) => item.medicineId === med.id);
    if (relevantItems.length === 0) return med;

    let updatedBatches = [...med.batches];

    for (const item of relevantItems) {
      const batchIndex = updatedBatches.findIndex((b) => b.id === item.batchId);
      if (batchIndex !== -1) {
        const currentBatch = updatedBatches[batchIndex];
        const newAvailable = currentBatch.availableQuantity + item.quantity;

        updatedBatches[batchIndex] = {
          ...currentBatch,
          availableQuantity: newAvailable,
        };

        auditLogs.push({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          action: 'INVENTORY_RESTOCK_APPROVED',
          details: `Restocked ${item.quantity} ${item.packagingUnit}s into Batch ${currentBatch.batchNumber} upon approved ${returnRequest.type} for Order ${returnRequest.orderNumber}. Stock increased from ${currentBatch.availableQuantity} to ${newAvailable}.`,
          actor,
          batchId: currentBatch.id,
          quantityDelta: item.quantity,
        });
      }
    }

    return {
      ...med,
      batches: updatedBatches,
    };
  });

  return { updatedMedicines, auditLogs };
}
