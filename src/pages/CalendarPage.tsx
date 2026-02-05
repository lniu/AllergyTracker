import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '../components/Calendar';
import { Button } from '../components/ui/Button';
import { useAllergyStore } from '../stores/allergyStore';
import { isDefined } from '../lib/typeGuards';
import type { FoodTrial } from '../types';

interface DayDetail {
  date: Date;
  trials: FoodTrial[];
}

export function CalendarPage() {
  const { t } = useTranslation();
  const { foodTrials, allergens, reactions } = useAllergyStore();
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);

  const handleDayClick = (date: Date, trials: FoodTrial[]) => {
    if (trials.length > 0) {
      setSelectedDay({ date, trials });
    }
  };

  const closeDetail = () => setSelectedDay(null);

  // Get allergen by ID
  const getAllergen = (id: string) => allergens.find((a) => a.id === id);

  // Check if a trial has a reaction
  const getTrialReaction = (trialId: string) => {
    return reactions.find((r) => r.foodTrialId === trialId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary-600" />
            {t('calendar.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('calendar.subtitle')}
          </p>
        </div>
        <Link to="/add-trial">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t('calendar.logTrial')}
          </Button>
        </Link>
      </div>

      {/* Calendar */}
      <Calendar
        foodTrials={foodTrials}
        allergens={allergens}
        reactions={reactions}
        onDayClick={handleDayClick}
      />

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDetail}
          />

          {/* Panel */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[80vh] overflow-auto shadow-xl">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t('calendar.close')}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Trial List */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500">
                {t('trial.foodTrialsOnDay', { count: selectedDay.trials.length })}
              </p>

              {selectedDay.trials.map((trial) => {
                const reaction = getTrialReaction(trial.id);
                const trialAllergens = trial.allergenIds
                  .map(getAllergen)
                  .filter(isDefined);

                return (
                  <div
                    key={trial.id}
                    className={`
                      p-4 rounded-lg border
                      ${reaction ? 'border-status-reaction bg-status-reaction-light/30' : 'border-gray-200 bg-gray-50'}
                    `}
                  >
                    {/* Food Name and Time */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {trial.foodName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(trial.date), 'h:mm a')}
                          {trial.amount && ` • ${trial.amount}`}
                        </p>
                      </div>
                      {reaction && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-status-reaction flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Allergens */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trialAllergens.map((allergen) => (
                        <span
                          key={allergen.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-sm border"
                        >
                          {allergen.icon && typeof allergen.icon === 'string' && <span>{allergen.icon}</span>}
                          <span>{allergen.name}</span>
                        </span>
                      ))}
                    </div>

                    {/* Notes */}
                    {trial.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic">
                        "{trial.notes}"
                      </p>
                    )}

                    {/* Reaction Details */}
                    {reaction && (
                      <div className="mt-3 pt-3 border-t border-status-reaction/30">
                        <p className="text-sm font-medium text-status-reaction flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {t('reactionForm.reactionRecorded')}
                        </p>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>
                            <span className="font-medium">{t('reactionForm.severity')}:</span>{' '}
                            <span className="capitalize">{t(`reactionForm.${reaction.severity}`)}</span>
                          </p>
                          <p>
                            <span className="font-medium">{t('reactionForm.symptoms')}:</span>{' '}
                            {reaction.symptoms.join(', ')}
                          </p>
                          <p>
                            <span className="font-medium">{t('export.timeAfterEating')}:</span>{' '}
                            {reaction.minutesAfterExposure} {t('export.minutes')}
                          </p>
                          {reaction.notes && (
                            <p className="mt-1 italic">"{reaction.notes}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quick action to add more */}
              <Link
                to="/add-trial"
                className="block text-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <Plus className="h-5 w-5 inline-block mr-1" />
                {t('calendar.logAnotherTrial')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {foodTrials.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('calendar.noTrialsYet')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('calendar.startLogging')}
          </p>
          <Link to="/add-trial">
            <Button>
              <Plus className="h-4 w-4" />
              {t('calendar.logFirstTrial')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
