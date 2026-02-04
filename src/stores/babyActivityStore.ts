import { db, id } from '../lib/instant';
import type { BabyActivity, BabyActivityType, FeedType } from '../types';

// Helper to check if two dates are the same day
function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper to get today's date as ISO string (start of day)
function getTodayStart(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

// Custom hook that uses InstantDB for real-time data
export function useBabyActivityStore() {
  const { data, isLoading, error } = db.useQuery({
    babyActivities: {},
  });

  // Cast and sort activities by timestamp descending (most recent first)
  const activities: BabyActivity[] = (data?.babyActivities ?? [])
    .map((a) => ({
      id: a.id,
      type: a.type as BabyActivityType,
      timestamp: a.timestamp,
      notes: a.notes,
      feedType: a.feedType as FeedType | undefined,
      feedAmount: a.feedAmount,
      duration: a.duration,
      createdAt: a.createdAt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Initialize is a no-op for InstantDB (data loads automatically)
  const initialize = async () => {
    // InstantDB handles initialization automatically
  };

  // Activity actions
  const addActivity = async (activity: Omit<BabyActivity, 'id'> & { id?: string }) => {
    const activityId = activity.id || id();
    await db.transact(
      db.tx.babyActivities[activityId].update({
        type: activity.type,
        timestamp: activity.timestamp,
        notes: activity.notes,
        feedType: activity.feedType,
        feedAmount: activity.feedAmount,
        duration: activity.duration,
        createdAt: activity.createdAt || new Date().toISOString(),
      })
    );
  };

  const updateActivity = async (activity: BabyActivity) => {
    await db.transact(
      db.tx.babyActivities[activity.id].update({
        type: activity.type,
        timestamp: activity.timestamp,
        notes: activity.notes,
        feedType: activity.feedType,
        feedAmount: activity.feedAmount,
        duration: activity.duration,
        createdAt: activity.createdAt,
      })
    );
  };

  const deleteActivity = async (activityId: string) => {
    await db.transact(db.tx.babyActivities[activityId].delete());
  };

  // Computed helpers
  const getActivitiesByDate = (date: string) => {
    return activities.filter((a) => isSameDay(a.timestamp, date));
  };

  const getActivitiesByType = (type: BabyActivityType) => {
    return activities.filter((a) => a.type === type);
  };

  const getTodayActivities = () => {
    const today = getTodayStart();
    return activities.filter((a) => isSameDay(a.timestamp, today));
  };

  const getLastActivityOfType = (type: BabyActivityType) => {
    return activities.find((a) => a.type === type);
  };

  const getLastSleepActivity = () => {
    return activities.find((a) => a.type === 'sleep');
  };

  const getTodaySummary = () => {
    const todayActivities = getTodayActivities();
    const summary: Record<BabyActivityType, number> = {
      sleep: 0,
      wake: 0,
      feed: 0,
      pee: 0,
      poop: 0,
    };

    todayActivities.forEach((activity) => {
      summary[activity.type as BabyActivityType]++;
    });

    return summary;
  };

  return {
    // State
    activities,
    isLoading,
    error,
    isInitialized: !isLoading,

    // Actions
    initialize,
    addActivity,
    updateActivity,
    deleteActivity,

    // Computed helpers
    getActivitiesByDate,
    getActivitiesByType,
    getTodayActivities,
    getLastActivityOfType,
    getLastSleepActivity,
    getTodaySummary,
  };
}
