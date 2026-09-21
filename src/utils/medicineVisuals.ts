import React from 'react';
import { Pill, Syringe, Droplet, Layers, Activity, HeartPulse, Apple, Tag, LucideIcon } from 'lucide-react';
import { Medicine } from '../types';

export interface MedicineVisualConfig {
  monogram: string;
  dosageForm: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export function getMedicineVisual(med: Medicine): MedicineVisualConfig {
  const nameLower = med.name.toLowerCase();
  const genericLower = med.genericName.toLowerCase();
  const packLower = (med.packagingUnit || '').toLowerCase();

  // 1. Determine Dosage Form & Representative Line Icon
  let dosageForm = 'TABLET';
  let icon: LucideIcon = Pill;

  if (nameLower.includes('inj') || nameLower.includes('vial') || genericLower.includes('injection') || packLower.includes('vial')) {
    dosageForm = 'INJECTION';
    icon = Syringe;
  } else if (nameLower.includes('syrup') || nameLower.includes('suspension') || nameLower.includes('drop') || genericLower.includes('syrup') || packLower.includes('bottle')) {
    dosageForm = 'ORAL LIQUID';
    icon = Droplet;
  } else if (nameLower.includes('cream') || nameLower.includes('gel') || nameLower.includes('ointment')) {
    dosageForm = 'TOPICAL';
    icon = Tag;
  } else if (nameLower.includes('infusion') || nameLower.includes('iv')) {
    dosageForm = 'IV INFUSION';
    icon = Syringe;
  } else if (nameLower.includes('capsule') || packLower.includes('capsule')) {
    dosageForm = 'CAPSULE';
    icon = Layers;
  } else {
    dosageForm = 'TABLET';
    icon = Pill;
  }

  // 2. Specific Monogram Abbreviation & Tinted Color Theme per formulation
  // Ensures visible products like Paracetamol (PC) and Azithromycin (AZ) have completely distinct visual identities
  if (nameLower.includes('paracetamol')) {
    return {
      monogram: 'PC',
      dosageForm: 'TAB 500mg',
      icon: Activity,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    };
  }

  if (nameLower.includes('azithromycin')) {
    return {
      monogram: 'AZ',
      dosageForm: 'TAB 500mg',
      icon: Layers,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    };
  }

  if (nameLower.includes('amoxyclav') || nameLower.includes('amox')) {
    return {
      monogram: 'AM',
      dosageForm: 'TAB 625mg',
      icon: Pill,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    };
  }

  if (nameLower.includes('pantoprazole') || nameLower.includes('panto')) {
    return {
      monogram: 'PT',
      dosageForm: 'TAB 40mg',
      icon: Droplet,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    };
  }

  if (nameLower.includes('ceftriaxone') || nameLower.includes('ceft')) {
    return {
      monogram: 'CF',
      dosageForm: 'VIAL 1g',
      icon: Syringe,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
    };
  }

  if (nameLower.includes('cetirizine')) {
    return {
      monogram: 'CZ',
      dosageForm: 'TAB 10mg',
      icon: Pill,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
    };
  }

  if (nameLower.includes('metformin')) {
    return {
      monogram: 'MF',
      dosageForm: 'TAB 500mg',
      icon: HeartPulse,
      bgColor: 'bg-teal-50',
      textColor: 'text-[#1A504C]',
      borderColor: 'border-teal-200',
    };
  }

  if (nameLower.includes('insulin')) {
    return {
      monogram: 'IN',
      dosageForm: 'COLD CHAIN 100IU',
      icon: Syringe,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
    };
  }

  if (nameLower.includes('syrup') || nameLower.includes('dextromethorphan')) {
    return {
      monogram: 'CS',
      dosageForm: 'SYRUP 100ml',
      icon: Droplet,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    };
  }

  // Fallback: derive 2-letter monogram from first letters of name
  const words = med.name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  const monogram = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase()
    : med.name.substring(0, 2).toUpperCase();

  return {
    monogram,
    dosageForm,
    icon,
    bgColor: 'bg-[#F5F8F6]',
    textColor: 'text-[#1A504C]',
    borderColor: 'border-gray-200',
  };
}
