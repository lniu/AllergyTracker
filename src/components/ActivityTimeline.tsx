import { useState } from 'react';
import { Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBabyActivityStore } from '../stores/babyActivityStore';
import type { BabyActivity } from '../types';
import { ACTIVITY_ICONS } from '../types';

interface ActivityTimelineProps {
  maxItems?: number;
}

// Helper to format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Helper to format time
function formatTime(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale !== 'zh',
  });
}

// Helper to format date for display
function formatDateLocalized(timestamp: string, locale: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Group activities by date
function groupActivitiesByDate(activities: BabyActivity[]): Map<string, BabyActivity[]> {
  const groups = new Map<string, BabyActivity[]>();
  
  activities.forEach((activity) => {
    const dateKey = new Date(activity.timestamp).toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, activity]);
  });

  return groups;
}

function ActivityItem({ 
  activity, 
  onDelete,
  t,
  locale
}: { 
  activity: BabyActivity; 
  onDelete: (id: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  locale: string;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const info = ACTIVITY_ICONS[activity.type];
  const labelKey = `activities.${activity.type}`;

  // Format relative time with translations
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t('babyLog.justNow');
    if (diffMins < 60) return t('babyLog.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('babyLog.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('babyLog.yesterday');
    return t('babyLog.daysAgo', { count: diffDays });
  };

  // Format feed type label
  const getFeedTypeLabel = (feedType: string): string => {
    if (feedType === 'solid') return t('activities.solidFood');
    return t(`activities.${feedType}`);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${info.color} transition-all`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Icon */}
      <span className="text-xl flex-shrink-0" aria-hidden="true">
        {info.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{t(labelKey)}</span>
          {activity.type === 'feed' && activity.feedType && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
              {getFeedTypeLabel(activity.feedType)}
            </span>
          )}
          {activity.type === 'wake' && activity.duration && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
              {t('babyLog.slept', { duration: formatDuration(activity.duration) })}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-2 mt-1 text-sm opacity-75">
          <Clock className="w-3 h-3" aria-hidden="true" />
          <span>{formatTime(activity.timestamp, locale)}</span>
          <span className="text-xs">({formatRelativeTime(activity.timestamp)})</span>
        </div>

        {/* Feed amount */}
        {activity.feedAmount && (
          <p className="text-sm mt-1">{activity.feedAmount}</p>
        )}

        {/* Notes */}
        {activity.notes && (
          <p className="text-sm mt-1 italic">{activity.notes}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(activity.id)}
        className={`p-2 rounded-lg hover:bg-white/50 transition-opacity ${
          showDelete ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        }`}
        aria-label={`Delete ${t(labelKey)} activity`}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ActivityTimeline({ maxItems = 20 }: ActivityTimelineProps) {
  const { t, i18n } = useTranslation();
  const { activities, deleteActivity, isLoading } = useBabyActivityStore();
  const [expanded, setExpanded] = useState(false);
  const locale = i18n.language;

  // Format date header with translations
  const formatDateHeader = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('babyLog.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('babyLog.yesterday');
    }
    return formatDateLocalized(timestamp, locale);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('babyLog.loadingActivities')}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('babyLog.noActivitiesYet')}</p>
        <p className="text-sm mt-1">{t('babyLog.startTracking')}</p>
      </div>
    );
  }

  const displayedActivities = expanded ? activities : activities.slice(0, maxItems);
  const groupedActivities = groupActivitiesByDate(displayedActivities);
  const hasMore = activities.length > maxItems;

  const handleDelete = async (id: string) => {
    if (confirm(t('babyLog.deleteActivity'))) {
      await deleteActivity(id);
    }
  };

  return (
    <div className="space-y-6">
      {Array.from(groupedActivities.entries()).map(([dateKey, dayActivities]) => (
        <div key={dateKey}>
          {/* Date header */}
          <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-gray-50 py-1">
            {formatDateHeader(dayActivities[0].timestamp)}
          </h3>

          {/* Activities for this day */}
          <div className="space-y-2">
            {dayActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onDelete={handleDelete}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Show more/less button */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
              {t('babyLog.showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
              {t('babyLog.showMore', { count: activities.length - maxItems })}
            </>
          )}
        </button>
      )}
    </div>
  );
}
