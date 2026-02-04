import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { Button } from './ui/Button';
import type { FoodTrial, Allergen, Reaction } from '../types';

interface CalendarProps {
  foodTrials: FoodTrial[];
  allergens: Allergen[];
  reactions: Reaction[];
  onDayClick?: (date: Date, trials: FoodTrial[]) => void;
}

export function Calendar({ foodTrials, allergens, reactions, onDayClick }: CalendarProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group food trials by date
  const trialsByDate = useMemo(() => {
    const map = new Map<string, FoodTrial[]>();
    foodTrials.forEach((trial) => {
      const dateKey = format(new Date(trial.date), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, trial]);
    });
    return map;
  }, [foodTrials]);

  // Check if a trial has a reaction
  const hasReaction = (trialId: string) => {
    return reactions.some((r) => r.foodTrialId === trialId);
  };

  // Get allergen by ID
  const getAllergen = (id: string) => {
    return allergens.find((a) => a.id === id);
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekDays = [
    t('calendar.weekdays.sun'),
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat'),
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-sm"
          >
            {t('calendar.today')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            aria-label={t('calendar.previousMonth')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            aria-label={t('calendar.nextMonth')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTrials = trialsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          // Collect unique allergens for this day
          const dayAllergens = new Map<string, { allergen: Allergen; hadReaction: boolean }>();
          dayTrials.forEach((trial) => {
            const trialHadReaction = hasReaction(trial.id);
            trial.allergenIds.forEach((allergenId) => {
              const allergen = getAllergen(allergenId);
              if (allergen) {
                const existing = dayAllergens.get(allergenId);
                // If any trial had a reaction, mark it
                if (!existing || trialHadReaction) {
                  dayAllergens.set(allergenId, { allergen, hadReaction: trialHadReaction });
                }
              }
            });
          });

          const allergenList = Array.from(dayAllergens.values());
          const hasAnyReaction = allergenList.some((a) => a.hadReaction);

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(day, dayTrials)}
              disabled={dayTrials.length === 0}
              className={`
                min-h-[80px] sm:min-h-[100px] p-1 border-b border-r text-left 
                transition-colors relative group
                ${index % 7 === 0 ? 'border-l-0' : ''}
                ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                ${dayTrials.length > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
                ${isCurrentDay ? 'ring-2 ring-inset ring-primary-500' : ''}
              `}
            >
              {/* Day Number */}
              <div
                className={`
                  text-sm font-medium mb-1
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${isCurrentDay ? 'text-primary-600' : ''}
                `}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${isCurrentDay ? 'bg-primary-600 text-white' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Allergen Indicators */}
              {allergenList.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {allergenList.slice(0, 4).map(({ allergen, hadReaction }) => (
                    <div
                      key={allergen.id}
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${hadReaction 
                          ? 'bg-status-reaction-light border border-status-reaction' 
                          : 'bg-status-safe-light border border-status-safe'
                        }
                      `}
                      title={`${allergen.name}${hadReaction ? ` (${t('calendar.reaction')})` : ''}`}
                    >
                      {hadReaction ? (
                        <AlertTriangle className="w-3 h-3 text-status-reaction" />
                      ) : (
                        <span className="text-[10px]">{allergen.icon}</span>
                      )}
                    </div>
                  ))}
                  {allergenList.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                      +{allergenList.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Trial count badge on hover */}
              {dayTrials.length > 0 && (
                <div
                  className={`
                    absolute top-1 right-1 w-5 h-5 rounded-full text-[10px] font-medium
                    flex items-center justify-center
                    ${hasAnyReaction ? 'bg-status-reaction text-white' : 'bg-primary-100 text-primary-700'}
                  `}
                >
                  {dayTrials.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-safe-light border border-status-safe" />
          <span>{t('calendar.noReaction')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-reaction-light border border-status-reaction flex items-center justify-center">
            <AlertTriangle className="w-2.5 h-2.5 text-status-reaction" />
          </div>
          <span>{t('calendar.hadReaction')}</span>
        </div>
      </div>
    </div>
  );
}
