import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReactionForm } from '../components/ReactionForm';

export function AddReactionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const preselectedTrial = searchParams.get('trial') || undefined;

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
          <h1 className="text-2xl font-bold text-gray-900">{t('reactionForm.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">
            {t('reactionForm.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-status-reaction-light border border-status-reaction/30 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          <strong>{t('common.important')}:</strong> {t('reactionForm.emergencyWarning')}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border p-6">
        <ReactionForm foodTrialId={preselectedTrial} />
      </div>
    </div>
  );
}
