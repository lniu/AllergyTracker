import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogForm } from '../components/ActivityLogForm';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { useBabyActivityStore } from '../stores/babyActivityStore';
import { ACTIVITY_ICONS } from '../types';
import type { BabyActivityType } from '../types';

function SummaryCard({ type, count }: { type: BabyActivityType; count: number }) {
  const { t } = useTranslation();
  const info = ACTIVITY_ICONS[type];
  const labelKey = `activities.${type}` as const;
  
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${info.color}`}>
      <span className="text-xl" aria-hidden="true">{info.icon}</span>
      <span className="text-2xl font-bold mt-1">{count}</span>
      <span className="text-xs">{t(labelKey)}</span>
    </div>
  );
}

export function BabyActivityPage() {
  const { t } = useTranslation();
  const { initialize, isInitialized, getTodaySummary } = useBabyActivityStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const summary = getTodaySummary();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('babyLog.title')}</h1>
        <p className="text-gray-500 mt-1">{t('babyLog.subtitle')}</p>
      </div>

      {/* Quick Log Section */}
      <section aria-labelledby="quick-log-heading">
        <h2 id="quick-log-heading" className="sr-only">{t('babyLog.quickLog')}</h2>
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <ActivityLogForm />
        </div>
      </section>

      {/* Today's Summary */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-lg font-semibold text-gray-900 mb-3">
          {t('babyLog.todaysSummary')}
        </h2>
        <div className="grid grid-cols-5 gap-2">
          <SummaryCard type="sleep" count={summary.sleep} />
          <SummaryCard type="wake" count={summary.wake} />
          <SummaryCard type="feed" count={summary.feed} />
          <SummaryCard type="pee" count={summary.pee} />
          <SummaryCard type="poop" count={summary.poop} />
        </div>
      </section>

      {/* Activity Timeline */}
      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-lg font-semibold text-gray-900 mb-3">
          {t('babyLog.recentActivity')}
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <ActivityTimeline maxItems={15} />
        </div>
      </section>
    </div>
  );
}
