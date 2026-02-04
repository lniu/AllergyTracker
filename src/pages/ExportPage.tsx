import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Table, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { useAllergyStore } from '../stores/allergyStore';
import { exportToCSV, exportToPDF, downloadCSV, downloadPDF } from '../lib/export';
import { format } from 'date-fns';

export function ExportPage() {
  const { t } = useTranslation();
  const { allergens, foodTrials, reactions, getAllergenStatus } = useAllergyStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const csv = exportToCSV({
        allergens,
        foodTrials,
        reactions,
        getAllergenStatus,
      });
      downloadCSV(csv, `allergy-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = exportToPDF({
        allergens,
        foodTrials,
        reactions,
        getAllergenStatus,
      });
      downloadPDF(doc, `allergy-tracker-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label={t('common.goBack')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('export.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('export.subtitle')}
          </p>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('export.dataSummary')}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{allergens.length}</p>
            <p className="text-sm text-gray-600">{t('export.allergens')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{foodTrials.length}</p>
            <p className="text-sm text-gray-600">{t('export.foodTrials')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{reactions.length}</p>
            <p className="text-sm text-gray-600">{t('export.reactions')}</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">{t('export.exportFormat')}</h2>

        {/* PDF Export */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{t('export.pdfReport')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('export.pdfDescription')}
              </p>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || foodTrials.length === 0}
            >
              <Download className="h-4 w-4" />
              {t('export.exportPDF')}
            </Button>
          </div>
        </div>

        {/* CSV Export */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Table className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{t('export.csvSpreadsheet')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('export.csvDescription')}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              disabled={isExporting || foodTrials.length === 0}
            >
              <Download className="h-4 w-4" />
              {t('export.exportCSV')}
            </Button>
          </div>
        </div>
      </div>

      {/* No Data Warning */}
      {foodTrials.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">
            {t('export.noDataWarning')}
          </p>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">{t('export.medicalDisclaimer')}</p>
        <p>
          {t('export.disclaimerText')}
        </p>
      </div>
    </div>
  );
}
