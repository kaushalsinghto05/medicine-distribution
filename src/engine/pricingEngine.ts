import { Medicine, PricingConfig, SlabPrice, DiscountRule } from '../types';

export interface PriceCalculationResult {
  distributorPrice: number; // Base standard distributor price
  overridePrice?: number;
  slabApplied?: SlabPrice;
  discountsApplied: DiscountRule[];
  effectiveUnitPrice: number;
  totalSubtotal: number;
  totalMrp: number;
  totalSavings: number;
  marginPercent: number; // Distributor margin vs MRP
}

export function computeEffectivePrice(
  medicine: Medicine,
  distributorId: string,
  quantity: number
): PriceCalculationResult {
  const pricing: PricingConfig = medicine.pricing;
  let unitPrice = pricing.standardDistributorPrice;
  let overridePrice: number | undefined;

  // 1. Check Distributor Specific Override
  if (pricing.distributorOverrides && pricing.distributorOverrides[distributorId] !== undefined) {
    overridePrice = pricing.distributorOverrides[distributorId];
    unitPrice = overridePrice;
  }

  // 2. Check Quantity Slabs (if any match the requested quantity)
  let slabApplied: SlabPrice | undefined;
  if (pricing.slabs && pricing.slabs.length > 0) {
    const matchingSlab = pricing.slabs.find(
      (slab) => quantity >= slab.minQty && (slab.maxQty === Infinity || quantity <= slab.maxQty)
    );
    if (matchingSlab) {
      slabApplied = matchingSlab;
      if (overridePrice !== undefined) {
        // Contract override takes precedence unless volume slab offers an even better rate
        unitPrice = Math.min(overridePrice, matchingSlab.pricePerUnit);
      } else {
        unitPrice = matchingSlab.pricePerUnit;
      }
    }
  }

  // 3. Check Applicable Active Discounts
  const today = new Date().toISOString().split('T')[0];
  const appliedDiscounts: DiscountRule[] = [];
  
  if (pricing.discounts && pricing.discounts.length > 0) {
    for (const discount of pricing.discounts) {
      if (discount.value > 0 && (!discount.validUntil || discount.validUntil >= today)) {
        appliedDiscounts.push(discount);
        if (discount.type === 'percentage') {
          unitPrice = Math.max(0, unitPrice * (1 - discount.value / 100));
        } else if (discount.type === 'flat') {
          unitPrice = Math.max(0, unitPrice - discount.value);
        }
      }
    }
  }

  // Round unit price to 2 decimals or whole rupees
  const effectiveUnitPrice = Math.round(unitPrice * 100) / 100;
  const totalSubtotal = Math.round(effectiveUnitPrice * quantity * 100) / 100;
  const totalMrp = Math.round(medicine.mrp * quantity * 100) / 100;
  const totalSavings = Math.max(0, totalMrp - totalSubtotal);
  const marginPercent = medicine.mrp > 0 ? Math.round(((medicine.mrp - effectiveUnitPrice) / medicine.mrp) * 100) : 0;

  return {
    distributorPrice: pricing.standardDistributorPrice,
    overridePrice,
    slabApplied,
    discountsApplied: appliedDiscounts,
    effectiveUnitPrice,
    totalSubtotal,
    totalMrp,
    totalSavings,
    marginPercent,
  };
}
