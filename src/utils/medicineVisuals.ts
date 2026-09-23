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

export interface MedicinePhotoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail: string;
}

export const PHARMACEUTICAL_PHOTO_PRESETS: MedicinePhotoPreset[] = [
  {
    id: 'blister-tablets',
    name: 'Tablets Blister Strip (Paracetamol / Dolo style)',
    category: 'Analgesics & Antipyretics',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'antibiotic-box',
    name: 'Antibiotic Box & Capsules (Azithromycin style)',
    category: 'Antibiotics',
    url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'pharma-strips',
    name: 'Aluminum Foil Strips (Amoxyclav / Panto style)',
    category: 'Antibiotics',
    url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'injection-vial',
    name: 'Sterile Injection Vial & Ampoule (Ceftriaxone style)',
    category: 'Critical Care',
    url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'syrup-bottle',
    name: 'Amber Glass Oral Suspension Bottle (Cough / Pediatric)',
    category: 'Respiratory',
    url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'coldchain-vial',
    name: 'Cold-Chain 2°C–8°C Biologic / Vaccine Vial',
    category: 'Cold-Chain',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'softgel-capsules',
    name: 'Nutraceutical Softgel Capsules (Omega / Vitamin)',
    category: 'Nutritional & Vitamins',
    url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'gastro-capsules',
    name: 'Enteric Coated Gastro Capsules (Pantoprazole / Omez)',
    category: 'Gastrointestinal',
    url: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=150&auto=format&fit=crop&q=80',
  },
];

export interface MedicineIndicationInfo {
  label: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  formLabel: string;
  primaryNeed: string;
}

export function getMedicineIndication(med: Medicine): MedicineIndicationInfo {
  if (med.indication) {
    return {
      label: med.indication,
      icon: med.indicationIcon || '🩺',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      formLabel: med.dosageFormLabel || (med.packagingUnit ? med.packagingUnit.toUpperCase() : 'PACK'),
      primaryNeed: med.primaryNeed || 'general',
    };
  }

  const name = (med.name + ' ' + med.genericName).toLowerCase();

  if (name.includes('paracetamol') || name.includes('dolo') || name.includes('crocin') || name.includes('calpol')) {
    return {
      label: 'Fever, Headache & Body Pain',
      icon: '🩺',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-200',
      formLabel: 'Tablets',
      primaryNeed: 'fever',
    };
  }

  if (name.includes('azithromycin') || name.includes('azithro')) {
    return {
      label: 'Throat, Lung & Chest Infection',
      icon: '🦠',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      badgeBorder: 'border-purple-200',
      formLabel: 'Tablets',
      primaryNeed: 'antibiotic',
    };
  }

  if (name.includes('amox') || name.includes('clav')) {
    return {
      label: 'Broad-Spectrum Antibiotic for Infections',
      icon: '🦠',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      formLabel: 'Tablets',
      primaryNeed: 'antibiotic',
    };
  }

  if (name.includes('ceftriaxone') || name.includes('xyz')) {
    return {
      label: 'Severe Bacterial Infection (Hospital IV/IM)',
      icon: '💉',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-800',
      badgeBorder: 'border-rose-200',
      formLabel: 'Injection Vial',
      primaryNeed: 'antibiotic',
    };
  }

  if (name.includes('pantoprazole') || name.includes('panto') || name.includes('omez') || name.includes('rabeprazole')) {
    return {
      label: 'Acidity, Gas & Heartburn Relief',
      icon: '🧪',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      formLabel: 'Gastro Tablets',
      primaryNeed: 'acidity',
    };
  }

  if (name.includes('telmisartan') || name.includes('telma') || name.includes('amlodipine')) {
    return {
      label: 'High Blood Pressure (BP) Control',
      icon: '🫀',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-800',
      badgeBorder: 'border-red-200',
      formLabel: 'Tablets',
      primaryNeed: 'bp',
    };
  }

  if (name.includes('metformin') || name.includes('glimepiride') || name.includes('glycomet')) {
    return {
      label: 'Type 2 Diabetes Blood Sugar Control',
      icon: '🩸',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-800',
      badgeBorder: 'border-teal-200',
      formLabel: 'PR Tablets',
      primaryNeed: 'diabetes',
    };
  }

  if (name.includes('syrup') || name.includes('cough') || name.includes('dextromethorphan')) {
    return {
      label: 'Dry & Wet Cough, Sore Throat Relief',
      icon: '🍯',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-800',
      badgeBorder: 'border-orange-200',
      formLabel: 'Syrup Bottle',
      primaryNeed: 'cough',
    };
  }

  if (name.includes('insulin')) {
    return {
      label: 'Diabetes Insulin Therapy (2°C-8°C)',
      icon: '❄️',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-800',
      badgeBorder: 'border-cyan-200',
      formLabel: 'Cold-Chain Vial',
      primaryNeed: 'cold_chain',
    };
  }

  if (name.includes('montelukast') || name.includes('cetirizine') || name.includes('levocetirizine')) {
    return {
      label: 'Asthma, Allergy & Runny Nose Relief',
      icon: '💨',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-800',
      badgeBorder: 'border-indigo-200',
      formLabel: 'Tablets',
      primaryNeed: 'cough',
    };
  }

  if (name.includes('vitamin') || name.includes('calcium') || name.includes('d3')) {
    return {
      label: 'Bone Strength & Immunity Booster',
      icon: '🦴',
      badgeBg: 'bg-lime-50',
      badgeText: 'text-lime-800',
      badgeBorder: 'border-lime-200',
      formLabel: 'Softgels',
      primaryNeed: 'vitamins',
    };
  }

  if (name.includes('diclofenac') || name.includes('gel') || name.includes('pain')) {
    return {
      label: 'Joint & Muscle Pain Relief',
      icon: '🩹',
      badgeBg: 'bg-yellow-50',
      badgeText: 'text-yellow-800',
      badgeBorder: 'border-yellow-200',
      formLabel: 'Topical Gel',
      primaryNeed: 'fever',
    };
  }

  // Fallback based on category
  const cat = med.category;
  if (cat === 'Antibiotics') {
    return { label: 'Bacterial Infections & Healing', icon: '🦠', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-800', badgeBorder: 'border-emerald-200', formLabel: 'Tablets', primaryNeed: 'antibiotic' };
  }
  if (cat === 'Analgesics & Antipyretics') {
    return { label: 'Pain & Fever Management', icon: '🩺', badgeBg: 'bg-blue-50', badgeText: 'text-blue-800', badgeBorder: 'border-blue-200', formLabel: 'Tablets', primaryNeed: 'fever' };
  }
  if (cat === 'Cardiovascular') {
    return { label: 'Cardiovascular & Heart Health', icon: '🫀', badgeBg: 'bg-rose-50', badgeText: 'text-rose-800', badgeBorder: 'border-rose-200', formLabel: 'Tablets', primaryNeed: 'bp' };
  }
  if (cat === 'Gastrointestinal') {
    return { label: 'Digestive & Gastric Relief', icon: '🧪', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800', badgeBorder: 'border-amber-200', formLabel: 'Gastro', primaryNeed: 'acidity' };
  }
  if (cat === 'Respiratory') {
    return { label: 'Respiratory & Bronchial Care', icon: '💨', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-800', badgeBorder: 'border-indigo-200', formLabel: 'Tablets', primaryNeed: 'cough' };
  }
  if (cat === 'Antidiabetic') {
    return { label: 'Blood Glucose Regulation', icon: '🩸', badgeBg: 'bg-teal-50', badgeText: 'text-teal-800', badgeBorder: 'border-teal-200', formLabel: 'Tablets', primaryNeed: 'diabetes' };
  }
  if (cat === 'Nutritional & Vitamins') {
    return { label: 'Essential Daily Wellness', icon: '⚡', badgeBg: 'bg-orange-50', badgeText: 'text-orange-800', badgeBorder: 'border-orange-200', formLabel: 'Capsules', primaryNeed: 'vitamins' };
  }

  return {
    label: med.genericName || 'General Formulation',
    icon: '💊',
    badgeBg: 'bg-gray-50',
    badgeText: 'text-gray-800',
    badgeBorder: 'border-gray-200',
    formLabel: med.packagingUnit || 'Pack',
    primaryNeed: 'general',
  };
}

export function getFallbackMedicineImage(med: Medicine): string {
  if (med.imageUrl) return med.imageUrl;
  const name = (med.name + ' ' + med.genericName).toLowerCase();
  if (name.includes('paracetamol') || name.includes('dolo') || name.includes('pcm')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('azithromycin') || name.includes('capsule')) {
    return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('amox') || name.includes('strip')) {
    return 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('inj') || name.includes('vial') || name.includes('ceft')) {
    return 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('syrup') || name.includes('liquid') || name.includes('suspension')) {
    return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('insulin') || med.regulatory?.isColdChain) {
    return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('vitamin') || name.includes('softgel')) {
    return 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('panto') || name.includes('gastro')) {
    return 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
}
