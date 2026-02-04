import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Allergen, FoodTrial, Reaction, AllergenStatus } from '../types';
import { STATUS_LABELS } from './colors';

interface ExportData {
  allergens: Allergen[];
  foodTrials: FoodTrial[];
  reactions: Reaction[];
  getAllergenStatus: (id: string) => AllergenStatus;
}

export function exportToCSV(data: ExportData): string {
  const { allergens, foodTrials, reactions, getAllergenStatus: _getAllergenStatus } = data;
  // _getAllergenStatus available if needed for future status-based CSV columns

  // Create CSV header
  const headers = [
    'Date',
    'Food Name',
    'Allergens',
    'Amount',
    'Notes',
    'Has Reaction',
    'Reaction Symptoms',
    'Reaction Severity',
    'Minutes After Exposure',
    'Reaction Notes',
  ];

  // Create CSV rows
  const rows = foodTrials
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((trial) => {
      const trialAllergens = trial.allergenIds
        .map((id) => allergens.find((a) => a.id === id)?.name || id)
        .join('; ');

      const trialReactions = reactions.filter((r) => r.foodTrialId === trial.id);
      const hasReaction = trialReactions.length > 0;
      const reactionSymptoms = trialReactions
        .flatMap((r) => r.symptoms)
        .join('; ');
      const reactionSeverity = trialReactions
        .map((r) => r.severity)
        .join('; ');
      const minutesAfter = trialReactions
        .map((r) => r.minutesAfterExposure)
        .join('; ');
      const reactionNotes = trialReactions
        .map((r) => r.notes)
        .filter(Boolean)
        .join('; ');

      return [
        format(new Date(trial.date), 'yyyy-MM-dd HH:mm'),
        trial.foodName,
        trialAllergens,
        trial.amount || '',
        trial.notes || '',
        hasReaction ? 'Yes' : 'No',
        reactionSymptoms,
        reactionSeverity,
        minutesAfter,
        reactionNotes,
      ];
    });

  // Escape CSV values and prevent formula injection
  const escapeCSV = (value: string) => {
    // Convert to string if not already
    const strValue = String(value);
    
    // Escape formula injection characters (=, +, -, @, tab, carriage return)
    // These can be interpreted as formulas in Excel/Google Sheets
    if (strValue.match(/^[=+\-@\t\r]/)) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    
    // Escape values containing special characters
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    
    return strValue;
  };

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csv;
}

export function exportToPDF(data: ExportData): jsPDF {
  const { allergens, foodTrials, reactions, getAllergenStatus } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Helper to add new page if needed
  const checkNewPage = (heightNeeded: number) => {
    if (y + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Baby Allergy Tracker Report', margin, y);
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, margin, y);
  y += 15;

  // Allergen Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Allergen Status Summary', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  allergens.forEach((allergen) => {
    checkNewPage(8);
    const status = getAllergenStatus(allergen.id);
    const trialCount = foodTrials.filter((t) =>
      t.allergenIds.includes(allergen.id)
    ).length;

    doc.text(
      `${allergen.name}: ${STATUS_LABELS[status]} (${trialCount} trials)`,
      margin,
      y
    );
    y += 6;
  });

  y += 10;

  // Food Trial History
  checkNewPage(20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Food Trial History', margin, y);
  y += 10;

  const sortedTrials = [...foodTrials].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  doc.setFontSize(10);
  sortedTrials.forEach((trial) => {
    checkNewPage(25);

    const trialAllergens = trial.allergenIds
      .map((id) => allergens.find((a) => a.id === id)?.name || id)
      .join(', ');

    const trialReactions = reactions.filter((r) => r.foodTrialId === trial.id);

    doc.setFont('helvetica', 'bold');
    doc.text(
      `${format(new Date(trial.date), 'MMM d, yyyy')} - ${trial.foodName}`,
      margin,
      y
    );
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(`Allergens: ${trialAllergens}`, margin + 5, y);
    y += 5;

    if (trial.amount) {
      doc.text(`Amount: ${trial.amount}`, margin + 5, y);
      y += 5;
    }

    if (trialReactions.length > 0) {
      trialReactions.forEach((reaction) => {
        checkNewPage(15);
        doc.setTextColor(238, 102, 119); // Reaction color
        doc.text(
          `REACTION: ${reaction.severity} - ${reaction.symptoms.join(', ')}`,
          margin + 5,
          y
        );
        doc.setTextColor(0, 0, 0);
        y += 5;
        doc.text(
          `Time after eating: ${reaction.minutesAfterExposure} minutes`,
          margin + 10,
          y
        );
        y += 5;
      });
    }

    y += 5;
  });

  // Medical Disclaimer
  checkNewPage(30);
  y += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const disclaimer =
    'DISCLAIMER: This report is for informational tracking only and does not provide medical advice. Always consult your pediatrician before introducing allergens, especially if your baby has eczema, existing allergies, or family history of allergies. Seek immediate medical attention for signs of severe allergic reaction.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(splitDisclaimer, margin, y);

  return doc;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
