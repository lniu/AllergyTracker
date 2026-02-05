import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/Button';
import { useAllergyStore } from '../stores/allergyStore';

export function AllergenDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    allergens, 
    reactions, 
    getAllergenStatus, 
    getTrialsForAllergen,
    getReactionsForAllergen,
    getSubItems,
    getParentStatus,
    getParentTrialCount,
    getTrialCount,
    getParentForSubItem,
  } = useAllergyStore();

  const allergen = allergens.find((a) => a.id === id);
  
  if (!allergen) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">{t('allergenDetail.notFound')}</h2>
        <Link to="/" className="text-primary-500 hover:underline mt-2 inline-block">
          {t('allergenDetail.returnToDashboard')}
        </Link>
      </div>
    );
  }

  const subItems = getSubItems(allergen.id);
  const isParent = subItems.length > 0;
  const parentAllergen = getParentForSubItem(allergen.id);
  const isSubItem = !!parentAllergen;

  // Use appropriate status and trial count based on whether this is a parent or sub-item
  const status = isParent ? getParentStatus(allergen.id) : getAllergenStatus(allergen.id);
  const trials = getTrialsForAllergen(allergen.id);
  const allergenReactions = getReactionsForAllergen(allergen.id);
  
  // For parent allergens, aggregate stats across all sub-items
  const totalTrials = isParent ? getParentTrialCount(allergen.id) : trials.length;
  const totalReactions = isParent 
    ? subItems.reduce((sum, sub) => sum + getReactionsForAllergen(sub.id).length, 0)
    : allergenReactions.length;

  // Sort trials by date, newest first
  const sortedTrials = [...trials].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get reactions for each trial
  const getTrialReactions = (trialId: string) => 
    reactions.filter((r) => r.foodTrialId === trialId);

  const statusDotColors = {
    safe: 'bg-status-safe',
    testing: 'bg-status-testing',
    reaction: 'bg-status-reaction',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          {/* Breadcrumb for sub-items */}
          {isSubItem && parentAllergen && (
            <Link 
              to={`/allergen/${parentAllergen.id}`}
              className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1 mb-1"
            >
              {parentAllergen.icon && typeof parentAllergen.icon === 'string' && <span>{parentAllergen.icon}</span>}
              {parentAllergen.name}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <div className="flex items-center gap-3">
            {allergen.icon && typeof allergen.icon === 'string' && (
              <span className="text-4xl" role="img" aria-hidden="true">
                {allergen.icon}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{allergen.name}</h1>
              <p className="text-gray-600 mt-1">{t(`status.${status}Desc`)}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={status} size="lg" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to={`/add-trial?allergen=${allergen.id}`} className="flex-1">
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            {t('dashboard.logFoodTrial')}
          </Button>
        </Link>
        {(trials.length > 0 || totalTrials > 0) && (
          <Link to="/add-reaction" className="flex-1">
            <Button variant="outline" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              {t('dashboard.logReaction')}
            </Button>
          </Link>
        )}
      </div>

      {/* Sub-items section for parent allergens */}
      {isParent && (
        <section aria-labelledby="subitems-heading">
          <h2 id="subitems-heading" className="text-lg font-semibold text-gray-900 mb-3">
            {t('allergenDetail.detailedFoods')}
          </h2>
          <div className="bg-white rounded-xl border divide-y">
            {subItems.map((subItem) => {
              const subStatus = getAllergenStatus(subItem.id);
              const subTrialCount = getTrialCount(subItem.id);
              
              return (
                <Link
                  key={subItem.id}
                  to={`/allergen/${subItem.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${statusDotColors[subStatus]}`}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-900">{subItem.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {t('trial.trialCount', { count: subTrialCount })}
                    </span>
                    <StatusBadge status={subStatus} size="sm" />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border text-center">
          <p className="text-2xl font-bold text-gray-900">{totalTrials}</p>
          <p className="text-sm text-gray-600">{t('allergenDetail.totalTrials')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <p className="text-2xl font-bold text-status-safe">{totalTrials - totalReactions}</p>
          <p className="text-sm text-gray-600">{t('allergenDetail.noReaction')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <p className="text-2xl font-bold text-status-reaction">{totalReactions}</p>
          <p className="text-sm text-gray-600">{t('allergenDetail.reactions')}</p>
        </div>
      </div>

      {/* Timeline - only show for sub-items or allergens without sub-items */}
      {!isParent && (
        <section aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="text-lg font-semibold text-gray-900 mb-4">
            {t('allergenDetail.trialHistory')}
          </h2>
          
          {sortedTrials.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-500">{t('allergenDetail.noTrialsRecorded')}</p>
              <Link
                to={`/add-trial?allergen=${allergen.id}`}
                className="text-primary-500 hover:underline mt-2 inline-block"
              >
                {t('allergenDetail.logYourFirstTrial')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTrials.map((trial, index) => {
                const trialReactions = getTrialReactions(trial.id);
                const hasReaction = trialReactions.length > 0;

                return (
                  <div
                    key={trial.id}
                    className={`relative bg-white rounded-xl border p-4 ${
                      hasReaction ? 'border-status-reaction/50 bg-status-reaction-light' : ''
                    }`}
                  >
                    {/* Timeline connector */}
                    {index < sortedTrials.length - 1 && (
                      <div
                        className="absolute left-8 top-full h-4 w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Trial number badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          hasReaction
                            ? 'bg-status-reaction text-white'
                            : 'bg-status-safe text-white'
                        }`}
                      >
                        {sortedTrials.length - index}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{trial.foodName}</h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(trial.date), 'PPp')}
                            </p>
                          </div>
                          {hasReaction && (
                            <StatusBadge status="reaction" size="sm" />
                          )}
                        </div>

                        {trial.amount && (
                          <p className="text-sm text-gray-600 mt-1">
                            Amount: {trial.amount}
                          </p>
                        )}

                        {trial.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {trial.notes}
                          </p>
                        )}

                        {/* Reaction details */}
                        {trialReactions.map((reaction) => (
                          <div
                            key={reaction.id}
                            className="mt-3 p-3 bg-white rounded-lg border border-status-reaction/30"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-status-reaction" />
                              <span className="text-sm font-medium text-status-reaction capitalize">
                                {t(`reactionForm.${reaction.severity}`)} {t('status.reaction')}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({t('reactionForm.minutesAfter', { count: reaction.minutesAfterExposure })})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {reaction.symptoms.map((symptom) => (
                                <span
                                  key={symptom}
                                  className="text-xs px-2 py-0.5 bg-status-reaction-light rounded-full text-gray-700"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                            {reaction.photos && reaction.photos.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {reaction.photos.map((photo, i) => (
                                  <img
                                    key={i}
                                    src={photo}
                                    alt={`Reaction photo ${i + 1}`}
                                    className="h-16 w-16 object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}
                            {reaction.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                {reaction.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* For parent allergens, show a note about logging trials at sub-item level */}
      {isParent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            {t('allergenDetail.parentAllergenNote')}
          </p>
        </div>
      )}
    </div>
  );
}
