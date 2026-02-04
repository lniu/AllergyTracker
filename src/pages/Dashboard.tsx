import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, FileDown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AllergenGrid } from '../components/AllergenGrid';
import { Button } from '../components/ui/Button';
import { useAllergyStore } from '../stores/allergyStore';
import { isDefined } from '../lib/typeGuards';
import { format } from 'date-fns';

export function Dashboard() {
  const { t } = useTranslation();
  const { foodTrials, reactions, allergens } = useAllergyStore();

  // Memoize recent trials to avoid expensive sort on every render
  const recentTrials = useMemo(() => {
    return [...foodTrials]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [foodTrials]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Link to="/export" aria-label={t('nav.export')}>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.export')}</span>
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to="/add-trial" className="flex-1">
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            {t('dashboard.logFoodTrial')}
          </Button>
        </Link>
        <Link to="/add-reaction" className="flex-1">
          <Button variant="outline" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            {t('dashboard.logReaction')}
          </Button>
        </Link>
      </div>

      {/* Allergen Grid */}
      <AllergenGrid />

      {/* Recent Activity */}
      {recentTrials.length > 0 && (
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.recentActivity')}
          </h2>
          <div className="bg-white rounded-xl border divide-y">
            {recentTrials.map((trial) => {
              const hasReaction = reactions.some((r) => r.foodTrialId === trial.id);
              const trialAllergens = trial.allergenIds
                .map((id) => allergens.find((a) => a.id === id))
                .filter(isDefined);

              return (
                <div key={trial.id} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      hasReaction ? 'bg-status-reaction-light' : 'bg-status-safe-light'
                    }`}
                  >
                    {hasReaction ? (
                      <AlertTriangle className="h-5 w-5 text-status-reaction" aria-hidden="true" />
                    ) : (
                      <span className="text-xl">
                        {trialAllergens[0]?.icon || '🍽️'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {trial.foodName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(trial.date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {trialAllergens.slice(0, 3).map((allergen) => (
                      <span
                        key={allergen.id}
                        className="text-xs px-2 py-0.5 bg-gray-100 rounded-full"
                      >
                        {allergen.name}
                      </span>
                    ))}
                    {trialAllergens.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        +{trialAllergens.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* First-time user guidance */}
      {foodTrials.length === 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex gap-4">
            <Info className="h-6 w-6 text-primary-600 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-primary-900">{t('dashboard.gettingStarted.title')}</h3>
              <p className="text-primary-700 mt-1">
                {t('dashboard.gettingStarted.message')}
              </p>
              <Link
                to="/add-trial"
                className="inline-flex items-center mt-3 py-2.5 text-primary-600 font-medium hover:underline min-h-[44px]"
              >
                {t('dashboard.gettingStarted.cta')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p>
          <strong>{t('common.disclaimer')}:</strong> {t('dashboard.disclaimer')}
        </p>
      </div>
    </div>
  );
}
