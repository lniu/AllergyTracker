import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Allergen, FoodTrial, Reaction, BabyActivity } from '../types';
import { BIG_9_ALLERGENS, ALLERGEN_SUB_ITEMS } from '../types';

interface AllergyTrackerDB extends DBSchema {
  allergens: {
    key: string;
    value: Allergen;
    indexes: { 'by-name': string };
  };
  foodTrials: {
    key: string;
    value: FoodTrial;
    indexes: { 
      'by-date': string;
      'by-allergen': string; // multiEntry index - queried by single string value
    };
  };
  reactions: {
    key: string;
    value: Reaction;
    indexes: { 'by-trial': string };
  };
  babyActivities: {
    key: string;
    value: BabyActivity;
    indexes: {
      'by-timestamp': string;
      'by-type': string;
    };
  };
}

const DB_NAME = 'allergy-tracker';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<AllergyTrackerDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<AllergyTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AllergyTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Allergens store
        if (!db.objectStoreNames.contains('allergens')) {
          const allergenStore = db.createObjectStore('allergens', { keyPath: 'id' });
          allergenStore.createIndex('by-name', 'name');
        }

        // Food trials store
        if (!db.objectStoreNames.contains('foodTrials')) {
          const trialStore = db.createObjectStore('foodTrials', { keyPath: 'id' });
          trialStore.createIndex('by-date', 'date');
          trialStore.createIndex('by-allergen', 'allergenIds', { multiEntry: true });
        }

        // Reactions store
        if (!db.objectStoreNames.contains('reactions')) {
          const reactionStore = db.createObjectStore('reactions', { keyPath: 'id' });
          reactionStore.createIndex('by-trial', 'foodTrialId');
        }

        // Baby activities store (added in v2)
        if (!db.objectStoreNames.contains('babyActivities')) {
          const activityStore = db.createObjectStore('babyActivities', { keyPath: 'id' });
          activityStore.createIndex('by-timestamp', 'timestamp');
          activityStore.createIndex('by-type', 'type');
        }
      },
    });
  }
  return dbPromise;
}

// Initialize with Big 9 allergens and their sub-items if empty
export async function initializeAllergens(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll('allergens');
  
  if (existing.length === 0) {
    const tx = db.transaction('allergens', 'readwrite');
    
    // Add Big 9 parent allergens
    const parentPromises = BIG_9_ALLERGENS.map(allergen => tx.store.put(allergen));
    
    // Add sub-items for each parent allergen
    const subItemPromises: Promise<string>[] = [];
    for (const parentId of Object.keys(ALLERGEN_SUB_ITEMS)) {
      const subItems = ALLERGEN_SUB_ITEMS[parentId];
      for (const subItem of subItems) {
        const allergen: Allergen = {
          id: subItem.id,
          name: subItem.name,
          isCustom: false,
          icon: subItem.icon,
          parentId: parentId,
        };
        subItemPromises.push(tx.store.put(allergen));
      }
    }
    
    await Promise.all([...parentPromises, ...subItemPromises, tx.done]);
  } else {
    // Check if sub-items need to be seeded (for existing databases)
    await seedMissingSubItems();
  }
}

// Seed sub-items for existing databases that don't have them
async function seedMissingSubItems(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll('allergens');
  const existingIds = new Set(existing.map(a => a.id));
  
  const tx = db.transaction('allergens', 'readwrite');
  const promises: Promise<string>[] = [];
  
  for (const parentId of Object.keys(ALLERGEN_SUB_ITEMS)) {
    const subItems = ALLERGEN_SUB_ITEMS[parentId];
    for (const subItem of subItems) {
      // Only add if not already exists
      if (!existingIds.has(subItem.id)) {
        const allergen: Allergen = {
          id: subItem.id,
          name: subItem.name,
          isCustom: false,
          icon: subItem.icon,
          parentId: parentId,
        };
        promises.push(tx.store.put(allergen));
      }
    }
  }
  
  if (promises.length > 0) {
    await Promise.all([...promises, tx.done]);
  }
}

// Allergen operations
export async function getAllAllergens(): Promise<Allergen[]> {
  const db = await getDB();
  return db.getAll('allergens');
}

export async function addAllergen(allergen: Allergen): Promise<void> {
  const db = await getDB();
  await db.put('allergens', allergen);
}

export async function deleteAllergen(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('allergens', id);
}

// Food trial operations
export async function getAllFoodTrials(): Promise<FoodTrial[]> {
  const db = await getDB();
  return db.getAll('foodTrials');
}

export async function getFoodTrialsByAllergen(allergenId: string): Promise<FoodTrial[]> {
  const db = await getDB();
  return db.getAllFromIndex('foodTrials', 'by-allergen', allergenId);
}

export async function addFoodTrial(trial: FoodTrial): Promise<void> {
  const db = await getDB();
  await db.put('foodTrials', trial);
}

export async function updateFoodTrial(trial: FoodTrial): Promise<void> {
  const db = await getDB();
  await db.put('foodTrials', trial);
}

export async function deleteFoodTrial(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('foodTrials', id);
}

// Reaction operations
export async function getAllReactions(): Promise<Reaction[]> {
  const db = await getDB();
  return db.getAll('reactions');
}

export async function getReactionsByTrial(trialId: string): Promise<Reaction[]> {
  const db = await getDB();
  return db.getAllFromIndex('reactions', 'by-trial', trialId);
}

export async function addReaction(reaction: Reaction): Promise<void> {
  const db = await getDB();
  await db.put('reactions', reaction);
}

export async function updateReaction(reaction: Reaction): Promise<void> {
  const db = await getDB();
  await db.put('reactions', reaction);
}

export async function deleteReaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('reactions', id);
}

// Baby activity operations
export async function getAllBabyActivities(): Promise<BabyActivity[]> {
  const db = await getDB();
  return db.getAll('babyActivities');
}

export async function getBabyActivitiesByType(type: string): Promise<BabyActivity[]> {
  const db = await getDB();
  return db.getAllFromIndex('babyActivities', 'by-type', type);
}

export async function addBabyActivity(activity: BabyActivity): Promise<void> {
  const db = await getDB();
  await db.put('babyActivities', activity);
}

export async function updateBabyActivity(activity: BabyActivity): Promise<void> {
  const db = await getDB();
  await db.put('babyActivities', activity);
}

export async function deleteBabyActivity(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('babyActivities', id);
}

// Export all data
export async function exportAllData() {
  const db = await getDB();
  const allergens = await db.getAll('allergens');
  const foodTrials = await db.getAll('foodTrials');
  const reactions = await db.getAll('reactions');
  const babyActivities = await db.getAll('babyActivities');
  
  return {
    allergens,
    foodTrials,
    reactions,
    babyActivities,
    exportedAt: new Date().toISOString(),
  };
}
