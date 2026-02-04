import { useState } from 'react';
import { Moon, Sun, Baby, Droplet, Circle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { useBabyActivityStore } from '../stores/babyActivityStore';
import type { BabyActivity, BabyActivityType, FeedType } from '../types';
import { ACTIVITY_ICONS, FEED_TYPES } from '../types';

interface ActivityLogFormProps {
  onSuccess?: () => void;
}

const ACTIVITY_BUTTONS: { type: BabyActivityType; Icon: typeof Moon }[] = [
  { type: 'sleep', Icon: Moon },
  { type: 'wake', Icon: Sun },
  { type: 'feed', Icon: Baby },
  { type: 'pee', Icon: Droplet },
  { type: 'poop', Icon: Circle },
];

export function ActivityLogForm({ onSuccess }: ActivityLogFormProps) {
  const { t } = useTranslation();
  const { addActivity, getLastSleepActivity } = useBabyActivityStore();
  
  const [selectedType, setSelectedType] = useState<BabyActivityType | null>(null);
  const [feedType, setFeedType] = useState<FeedType>('bottle');
  const [feedAmount, setFeedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLog = async (type: BabyActivityType) => {
    // For feed type, we need additional info
    if (type === 'feed') {
      setSelectedType(type);
      return;
    }

    // Quick log for other types
    await logActivity(type);
  };

  const logActivity = async (type: BabyActivityType) => {
    setIsSubmitting(true);
    try {
      const timestamp = useCustomTime ? new Date(customTime).toISOString() : new Date().toISOString();
      
      // Calculate sleep duration if logging a wake event
      let duration: number | undefined;
      if (type === 'wake') {
        const lastSleep = getLastSleepActivity();
        if (lastSleep) {
          const sleepTime = new Date(lastSleep.timestamp).getTime();
          const wakeTime = new Date(timestamp).getTime();
          duration = Math.round((wakeTime - sleepTime) / (1000 * 60)); // minutes
        }
      }

      const activity: BabyActivity = {
        id: crypto.randomUUID(),
        type,
        timestamp,
        notes: notes.trim() || undefined,
        feedType: type === 'feed' ? feedType : undefined,
        feedAmount: type === 'feed' && feedAmount.trim() ? feedAmount.trim() : undefined,
        duration,
        createdAt: new Date().toISOString(),
      };

      await addActivity(activity);
      
      // Reset form
      setSelectedType(null);
      setNotes('');
      setFeedAmount('');
      setUseCustomTime(false);
      
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType === 'feed') {
      await logActivity('feed');
    }
  };

  const cancelSelection = () => {
    setSelectedType(null);
    setNotes('');
    setFeedAmount('');
    setUseCustomTime(false);
  };

  return (
    <div className="space-y-4">
      {/* Quick action buttons */}
      <div className="grid grid-cols-5 gap-2">
        {ACTIVITY_BUTTONS.map(({ type }) => {
          const info = ACTIVITY_ICONS[type];
          const isSelected = selectedType === type;
          const labelKey = `activities.${type}` as const;
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleQuickLog(type)}
              disabled={isSubmitting}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isSelected
                  ? `${info.color} border-current ring-2 ring-offset-2 ring-current`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Log ${t(labelKey)}`}
              aria-pressed={isSelected}
            >
              <span className="text-2xl mb-1" aria-hidden="true">
                {info.icon}
              </span>
              <span className="text-xs font-medium">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Feed details form */}
      {selectedType === 'feed' && (
        <form onSubmit={handleSubmitFeed} className="bg-blue-50 rounded-xl p-4 space-y-4 border border-blue-200">
          <h3 className="font-medium text-blue-900">{t('babyLog.feedDetails')}</h3>
          
          {/* Feed type selection */}
          <div>
            <label className="form-label text-blue-900">{t('babyLog.type')}</label>
            <div className="flex gap-2">
              {FEED_TYPES.map(({ value }) => {
                const feedLabelKey = value === 'solid' ? 'activities.solidFood' : `activities.${value}`;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedType(value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                      feedType === value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                    }`}
                    aria-label={`Select ${t(feedLabelKey)} feed type`}
                    aria-pressed={feedType === value}
                  >
                    {t(feedLabelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount (optional) */}
          <div>
            <label htmlFor="feedAmount" className="form-label text-blue-900">
              {t('babyLog.amountOptional')}
            </label>
            <input
              type="text"
              id="feedAmount"
              value={feedAmount}
              onChange={(e) => setFeedAmount(e.target.value)}
              className="form-input"
              placeholder={t('babyLog.amountPlaceholder')}
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label htmlFor="feedNotes" className="form-label text-blue-900">
              {t('babyLog.notesOptional')}
            </label>
            <input
              type="text"
              id="feedNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder={t('babyLog.notesPlaceholder')}
            />
          </div>

          {/* Custom time toggle */}
          <div>
            <button
              type="button"
              onClick={() => setUseCustomTime(!useCustomTime)}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
            >
              <Clock className="w-4 h-4" />
              {useCustomTime ? t('babyLog.useCurrentTime') : t('babyLog.setCustomTime')}
            </button>
            
            {useCustomTime && (
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="form-input mt-2"
              />
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelSelection}
              className="flex-1"
            >
              {t('babyLog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? t('babyLog.logging') : t('babyLog.logFeed')}
            </Button>
          </div>
        </form>
      )}

      {/* Hint text */}
      {!selectedType && (
        <p className="text-center text-sm text-gray-500">
          {t('babyLog.tapToLog')}
        </p>
      )}
    </div>
  );
}
