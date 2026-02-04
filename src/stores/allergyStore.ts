import { db, id, seedAllergens } from '../lib/instant';
import type { Allergen, FoodTrial, Reaction, AllergenStatus } from '../types';

// Custom hook that uses InstantDB for real-time data
// db is guaranteed non-null here because App.tsx guards against it
export function useAllergyStore() {
  const { data, isLoading, error } = db!.useQuery({
    allergens: {},
    foodTrials: {},
    reactions: {},
  });

  // Cast InstantDB data to proper types
  const allergens: Allergen[] = (data?.allergens ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    isCustom: a.isCustom,
    icon: a.icon,
    parentId: a.parentId,
  }));

  const foodTrials: FoodTrial[] = (data?.foodTrials ?? []).map((t) => ({
    id: t.id,
    foodName: t.foodName,
    allergenIds: t.allergenIds as string[],
    date: t.date,
    amount: t.amount,
    notes: t.notes,
    createdAt: t.createdAt,
  }));

  const reactions: Reaction[] = (data?.reactions ?? []).map((r) => ({
    id: r.id,
    foodTrialId: r.foodTrialId,
    symptoms: r.symptoms as string[],
    severity: r.severity as 'mild' | 'moderate' | 'severe',
    minutesAfterExposure: r.minutesAfterExposure,
    photos: r.photos as string[] | undefined,
    notes: r.notes,
    createdAt: r.createdAt,
  }));

  // Initialize/seed data on first load
  const initialize = async () => {
    await seedAllergens();
  };

  // Allergen actions
  const addAllergen = async (allergen: Allergen) => {
    await db!.transact(
      db!.tx.allergens[allergen.id].update({
        name: allergen.name,
        isCustom: allergen.isCustom,
        icon: allergen.icon,
        parentId: allergen.parentId,
      })
    );
  };

  const deleteAllergen = async (allergenId: string) => {
    await db!.transact(db!.tx.allergens[allergenId].delete());
  };

  // Food trial actions
  const addFoodTrial = async (trial: Omit<FoodTrial, 'id'> & { id?: string }) => {
    const trialId = trial.id || id();
    await db!.transact(
      db!.tx.foodTrials[trialId].update({
        foodName: trial.foodName,
        allergenIds: trial.allergenIds,
        date: trial.date,
        amount: trial.amount,
        notes: trial.notes,
        createdAt: trial.createdAt || new Date().toISOString(),
      })
    );
  };

  const updateFoodTrial = async (trial: FoodTrial) => {
    await db!.transact(
      db!.tx.foodTrials[trial.id].update({
        foodName: trial.foodName,
        allergenIds: trial.allergenIds,
        date: trial.date,
        amount: trial.amount,
        notes: trial.notes,
        createdAt: trial.createdAt,
      })
    );
  };

  const deleteFoodTrial = async (trialId: string) => {
    await db!.transact(db!.tx.foodTrials[trialId].delete());
  };

  // Reaction actions
  const addReaction = async (reaction: Omit<Reaction, 'id'> & { id?: string }) => {
    const reactionId = reaction.id || id();
    await db!.transact(
      db!.tx.reactions[reactionId].update({
        foodTrialId: reaction.foodTrialId,
        symptoms: reaction.symptoms,
        severity: reaction.severity,
        minutesAfterExposure: reaction.minutesAfterExposure,
        photos: reaction.photos,
        notes: reaction.notes,
        createdAt: reaction.createdAt || new Date().toISOString(),
      })
    );
  };

  const updateReaction = async (reaction: Reaction) => {
    await db!.transact(
      db!.tx.reactions[reaction.id].update({
        foodTrialId: reaction.foodTrialId,
        symptoms: reaction.symptoms,
        severity: reaction.severity,
        minutesAfterExposure: reaction.minutesAfterExposure,
        photos: reaction.photos,
        notes: reaction.notes,
        createdAt: reaction.createdAt,
      })
    );
  };

  const deleteReaction = async (reactionId: string) => {
    await db!.transact(db!.tx.reactions[reactionId].delete());
  };

  // Computed functions
  const getAllergenStatus = (allergenId: string): AllergenStatus => {
    // Get all trials for this allergen
    const allergenTrials = foodTrials.filter((t) =>
      t.allergenIds.includes(allergenId)
    );

    // Check if any trial has a reaction
    const trialIds = allergenTrials.map((t) => t.id);
    const hasReaction = reactions.some((r) => trialIds.includes(r.foodTrialId));

    if (hasReaction) {
      return 'reaction';
    }

    // If 3+ trials with no reactions, it's safe
    if (allergenTrials.length >= 3) {
      return 'safe';
    }

    // Otherwise, still testing
    return 'testing';
  };

  const getTrialsForAllergen = (allergenId: string) => {
    return foodTrials.filter((t) => t.allergenIds.includes(allergenId));
  };

  const getReactionsForAllergen = (allergenId: string) => {
    const allergenTrials = foodTrials.filter((t) =>
      t.allergenIds.includes(allergenId)
    );
    const trialIds = allergenTrials.map((t) => t.id);
    return reactions.filter((r) => trialIds.includes(r.foodTrialId));
  };

  const getTrialCount = (allergenId: string) => {
    return foodTrials.filter((t) => t.allergenIds.includes(allergenId)).length;
  };

  // Hierarchy helpers
  const getParentAllergens = () => {
    return allergens.filter((a) => !a.parentId);
  };

  const getSubItems = (parentId: string) => {
    return allergens.filter((a) => a.parentId === parentId);
  };

  const getParentStatus = (parentId: string): AllergenStatus => {
    const subItems = allergens.filter((a) => a.parentId === parentId);

    // If any sub-item has a reaction, parent has reaction
    const hasReaction = subItems.some(
      (sub) => getAllergenStatus(sub.id) === 'reaction'
    );
    if (hasReaction) {
      return 'reaction';
    }

    // If all sub-items are safe, parent is safe
    const allSafe =
      subItems.length > 0 &&
      subItems.every((sub) => getAllergenStatus(sub.id) === 'safe');
    if (allSafe) {
      return 'safe';
    }

    // Otherwise testing
    return 'testing';
  };

  const getParentTrialCount = (parentId: string) => {
    const subItems = allergens.filter((a) => a.parentId === parentId);

    // Sum up trial counts from all sub-items
    return subItems.reduce((total, sub) => total + getTrialCount(sub.id), 0);
  };

  const isParentAllergen = (allergenId: string) => {
    const allergen = allergens.find((a) => a.id === allergenId);
    return allergen ? !allergen.parentId : false;
  };

  const getParentForSubItem = (subItemId: string) => {
    const subItem = allergens.find((a) => a.id === subItemId);
    if (subItem?.parentId) {
      return allergens.find((a) => a.id === subItem.parentId);
    }
    return undefined;
  };

  return {
    // State
    allergens,
    foodTrials,
    reactions,
    isLoading,
    error,
    isInitialized: !isLoading && allergens.length > 0,

    // Actions
    initialize,
    addAllergen,
    deleteAllergen,
    addFoodTrial,
    updateFoodTrial,
    deleteFoodTrial,
    addReaction,
    updateReaction,
    deleteReaction,

    // Computed
    getAllergenStatus,
    getTrialsForAllergen,
    getReactionsForAllergen,
    getTrialCount,

    // Hierarchy helpers
    getParentAllergens,
    getSubItems,
    getParentStatus,
    getParentTrialCount,
    isParentAllergen,
    getParentForSubItem,
  };
}
