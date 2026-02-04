import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FoodTrialForm } from '../components/FoodTrialForm';

export function AddTrialPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const preselectedAllergen = searchParams.get('allergen') || undefined;

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
          <h1 className="text-2xl font-bold text-gray-900">{t('foodTrialForm.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">
            {t('foodTrialForm.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border p-6">
        <FoodTrialForm preselectedAllergenId={preselectedAllergen} />
      </div>
    </div>
  );
}
