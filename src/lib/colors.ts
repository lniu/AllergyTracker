// Colorblind-friendly palette based on Paul Tol's recommendations
// Tested for deuteranopia and protanopia

import type { AllergenStatus } from '../types';

export const STATUS_COLORS = {
  safe: {
    bg: '#228833',
    bgLight: '#e8f5ea',
    text: '#ffffff',
    border: '#1a6327',
  },
  testing: {
    bg: '#FF8800',
    bgLight: '#fff4e6',
    text: '#ffffff',
    border: '#cc6d00',
  },
  reaction: {
    bg: '#EE6677',
    bgLight: '#fdeef0',
    text: '#ffffff',
    border: '#cc4455',
  },
} as const;

export const STATUS_LABELS: Record<AllergenStatus, string> = {
  safe: 'Safe',
  testing: 'Testing',
  reaction: 'Reaction',
};

export const STATUS_DESCRIPTIONS: Record<AllergenStatus, string> = {
  safe: 'Introduced 3+ times with no reactions',
  testing: 'Currently being introduced (fewer than 3 exposures)',
  reaction: 'A reaction has been documented',
};

export function getStatusColor(status: AllergenStatus) {
  return STATUS_COLORS[status];
}
