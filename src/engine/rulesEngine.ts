import { Distributor, Medicine, OrderingRules, RuleValidationResult } from '../types';
import { computeEffectivePrice } from './pricingEngine';

export function generateRuleSummary(
  rules: OrderingRules,
  distributorName: string = 'Distributor',
  packagingUnit: string = 'units'
): string {
  const parts: string[] = [];
  
  if (rules.minOrderQty > 0) {
    parts.push(`min order ${rules.minOrderQty} ${packagingUnit}`);
  }
  if (rules.orderMultiple > 1) {
    parts.push(`multiples of ${rules.orderMultiple}`);
  }
  if (rules.maxOrderQty > 0) {
    parts.push(`max ${rules.maxOrderQty} ${packagingUnit}/order`);
  }
  if (rules.monthlyLimit > 0) {
    parts.push(`${rules.monthlyLimit.toLocaleString()} ${packagingUnit}/month`);
  }
  if (rules.shortageBehavior) {
    const shortageMap = {
      reject: 'Shortage: Reject order',
      partial: 'Shortage: Partial fulfilment',
      backorder: 'Shortage: Backorder allowed',
    };
    parts.push(shortageMap[rules.shortageBehavior]);
  }

  return `${distributorName}: ${parts.join(', ')}.`;
}

export function checkDistributorEligibility(
  distributor: Distributor,
  medicine: Medicine
): { isEligible: boolean; issues: string[]; checklist: { label: string; passed: boolean; note?: string }[] } {
  const issues: string[] = [];
  const checklist: { label: string; passed: boolean; note?: string }[] = [];

  const tenantRelation = distributor.authorizedTenants[medicine.tenantId];

  // 1. Authorization Status
  const isApproved = Boolean(tenantRelation && tenantRelation.status === 'approved');
  checklist.push({
    label: 'Manufacturer Authorization',
    passed: isApproved,
    note: tenantRelation ? `Status: ${tenantRelation.status.toUpperCase()}` : 'Not registered with manufacturer',
  });
  if (!isApproved) {
    issues.push(
      tenantRelation
        ? `Distributor authorization is currently ${tenantRelation.status.toUpperCase()} with this manufacturer.`
        : 'Distributor is not authorized with this manufacturer.'
    );
  }

  // 2. Account Status
  const isAccountActive = distributor.accountStatus === 'active';
  checklist.push({
    label: 'Distributor Account Status',
    passed: isAccountActive,
    note: `Account is ${distributor.accountStatus}`,
  });
  if (!isAccountActive) {
    issues.push(`Distributor account is ${distributor.accountStatus}. Transactions are disabled.`);
  }

  // 3. Drug License (Form 20B / Form 21B)
  const hasLicenses = Boolean(distributor.licenses.form20B && distributor.licenses.form21B);
  const licenseVerified = distributor.licenses.verified;
  const isLicenseNotExpired = new Date(distributor.licenses.validTo) > new Date();

  checklist.push({
    label: 'Wholesale Drug Licenses (Form 20B & 21B)',
    passed: hasLicenses && isLicenseNotExpired,
    note: `Valid until ${distributor.licenses.validTo}`,
  });
  if (!hasLicenses || !isLicenseNotExpired) {
    issues.push('Drug wholesale license (Form 20B/21B) is either missing or expired.');
  }

  checklist.push({
    label: 'License Verification by Regulatory Cell',
    passed: licenseVerified,
    note: licenseVerified ? 'Verified & approved' : 'Pending physical document verification',
  });
  if (medicine.rules.distributorEligibility.licenseVerifiedRequired && !licenseVerified) {
    issues.push('Regulatory verification of wholesale drug license is mandatory for this product.');
  }

  // 4. Schedule Specific Authorization
  if (medicine.regulatory.scheduleClassification === 'Schedule X') {
    checklist.push({
      label: 'Schedule X Special Endorsement',
      passed: false,
      note: 'Requires separate Schedule X state authorization',
    });
    issues.push('Schedule X formulation requires specialized state authority license endorsement.');
  } else {
    checklist.push({
      label: 'Formulation Category Eligibility',
      passed: true,
      note: `${medicine.regulatory.scheduleClassification} authorized under wholesale license`,
    });
  }

  return {
    isEligible: issues.length === 0,
    issues,
    checklist,
  };
}

export function validateOrderQuantity(
  distributor: Distributor,
  medicine: Medicine,
  quantity: number
): RuleValidationResult {
  const rules = medicine.rules;
  const errors: string[] = [];
  const warnings: string[] = [];
  const unit = medicine.packagingUnit || 'strip';
  const unitPlural = unit === 'box' ? 'boxes' : `${unit}s`;

  // Eligibility check
  const eligibility = checkDistributorEligibility(distributor, medicine);
  if (!eligibility.isEligible) {
    errors.push(...eligibility.issues);
  }

  // Tenant Quota Tracking
  const tenantRelation = distributor.authorizedTenants[medicine.tenantId];
  const monthlyLimit =
    rules.monthlyLimit > 0
      ? rules.monthlyLimit
      : tenantRelation?.monthlyQuantityLimit != null && tenantRelation.monthlyQuantityLimit > 0
      ? tenantRelation.monthlyQuantityLimit
      : 2000;
  const monthlyUsed = tenantRelation?.monthlyQuantityUsed || 0;
  const remainingMonthlyQuota = Math.max(0, monthlyLimit - monthlyUsed);

  // If quantity is 0 or negative
  if (quantity <= 0) {
    errors.push('Please enter a quantity greater than 0.');
  }

  // Test Case 4: Below Minimum Order Quantity
  if (quantity > 0 && quantity < rules.minOrderQty) {
    errors.push(`Minimum order is ${rules.minOrderQty} ${unitPlural}.`);
  }

  // Test Case 1: Exceeds Maximum Quantity Per Order
  if (rules.maxOrderQty > 0 && quantity > rules.maxOrderQty) {
    errors.push(
      `Order quantity (${quantity} ${unitPlural}) exceeds maximum allowed limit of ${rules.maxOrderQty} ${unitPlural} per order.`
    );
  }

  // Test Case 3: Order Quantity Multiples
  if (rules.orderMultiple > 1 && quantity > 0 && quantity % rules.orderMultiple !== 0) {
    errors.push(`Order quantity must be in multiples of ${rules.orderMultiple} ${unitPlural}.`);
  }

  // Monthly Purchase Limit / Quota check
  if (quantity > 0 && quantity > remainingMonthlyQuota) {
    errors.push(
      `Exceeds monthly purchase limit. You have ${remainingMonthlyQuota.toLocaleString()} of ${monthlyLimit.toLocaleString()} ${unitPlural} remaining this month.`
    );
  }

  // Distributor Total Cap Check (if set)
  if (rules.maxDistributorCap > 0 && quantity > rules.maxDistributorCap) {
    errors.push(
      `Quantity exceeds distributor overall cap of ${rules.maxDistributorCap.toLocaleString()} ${unitPlural}.`
    );
  }

  // Check batch stock availability warning
  const totalStock = medicine.batches.reduce((sum, b) => sum + b.availableQuantity, 0);
  if (quantity > totalStock) {
    if (rules.shortageBehavior === 'reject') {
      errors.push(
        `Insufficient batch stock. Requested ${quantity} ${unit}s, but only ${totalStock} available. Manufacturer policy: Reject order.`
      );
    } else if (rules.shortageBehavior === 'partial') {
      warnings.push(
        `Available stock (${totalStock} ${unit}s) is less than requested (${quantity} ${unit}s). Partial fulfilment will dispatch ${totalStock} ${unit}s.`
      );
    } else if (rules.shortageBehavior === 'backorder') {
      warnings.push(
        `Available stock is ${totalStock} ${unit}s. The remaining ${quantity - totalStock} ${unit}s will be placed on backorder.`
      );
    }
  }

  // Effective price computation
  const priceResult = computeEffectivePrice(medicine, distributor.id, Math.max(1, quantity));
  const ruleSummary = generateRuleSummary(rules, distributor.name, unit);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    ruleSummary,
    effectivePrice: priceResult.effectiveUnitPrice,
    totalComputedPrice: priceResult.totalSubtotal,
    remainingMonthlyQuota,
    isEligible: eligibility.isEligible,
    eligibilityIssues: eligibility.issues,
  };
}
