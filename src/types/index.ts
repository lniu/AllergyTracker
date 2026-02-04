export type AllergenStatus = 'safe' | 'testing' | 'reaction';

export interface Allergen {
  id: string;
  name: string;
  isCustom: boolean;
  icon?: string;
  parentId?: string; // Reference to parent allergen (for sub-items)
}

export interface FoodTrial {
  id: string;
  foodName: string;
  allergenIds: string[];
  date: string; // ISO string
  amount?: string;
  notes?: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  foodTrialId: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  minutesAfterExposure: number;
  photos?: string[]; // base64 strings
  notes?: string;
  createdAt: string;
}

// Big 9 allergens as defined by FDA
export const BIG_9_ALLERGENS: Allergen[] = [
  { id: 'milk', name: 'Milk', isCustom: false, icon: '🥛' },
  { id: 'eggs', name: 'Eggs', isCustom: false, icon: '🥚' },
  { id: 'fish', name: 'Fish', isCustom: false, icon: '🐟' },
  { id: 'shellfish', name: 'Shellfish', isCustom: false, icon: '🦐' },
  { id: 'tree-nuts', name: 'Tree Nuts', isCustom: false, icon: '🌰' },
  { id: 'peanuts', name: 'Peanuts', isCustom: false, icon: '🥜' },
  { id: 'wheat', name: 'Wheat', isCustom: false, icon: '🌾' },
  { id: 'soy', name: 'Soy', isCustom: false, icon: '🫛' },
  { id: 'sesame', name: 'Sesame', isCustom: false, icon: '🌱' },
];

// Detailed sub-items for each major allergen category
export const ALLERGEN_SUB_ITEMS: Record<string, Array<{ id: string; name: string; icon?: string }>> = {
  'milk': [
    { id: 'cow-milk', name: 'Cow Milk' },
    { id: 'cheese', name: 'Cheese' },
    { id: 'butter', name: 'Butter' },
    { id: 'yogurt', name: 'Yogurt' },
    { id: 'cream', name: 'Cream' },
    { id: 'ice-cream', name: 'Ice Cream' },
    { id: 'whey', name: 'Whey' },
    { id: 'casein', name: 'Casein' },
  ],
  'eggs': [
    { id: 'chicken-egg', name: 'Chicken Egg' },
    { id: 'egg-white', name: 'Egg White' },
    { id: 'egg-yolk', name: 'Egg Yolk' },
    { id: 'duck-egg', name: 'Duck Egg' },
    { id: 'quail-egg', name: 'Quail Egg' },
  ],
  'fish': [
    { id: 'salmon', name: 'Salmon' },
    { id: 'tuna', name: 'Tuna' },
    { id: 'cod', name: 'Cod' },
    { id: 'tilapia', name: 'Tilapia' },
    { id: 'halibut', name: 'Halibut' },
    { id: 'trout', name: 'Trout' },
    { id: 'bass', name: 'Bass' },
    { id: 'sardine', name: 'Sardine' },
    { id: 'anchovy', name: 'Anchovy' },
  ],
  'shellfish': [
    { id: 'shrimp', name: 'Shrimp' },
    { id: 'crab', name: 'Crab' },
    { id: 'lobster', name: 'Lobster' },
    { id: 'clam', name: 'Clam' },
    { id: 'mussel', name: 'Mussel' },
    { id: 'oyster', name: 'Oyster' },
    { id: 'scallop', name: 'Scallop' },
    { id: 'crawfish', name: 'Crawfish' },
  ],
  'tree-nuts': [
    { id: 'walnut', name: 'Walnut' },
    { id: 'almond', name: 'Almond' },
    { id: 'cashew', name: 'Cashew' },
    { id: 'hazelnut', name: 'Hazelnut' },
    { id: 'pecan', name: 'Pecan' },
    { id: 'pistachio', name: 'Pistachio' },
    { id: 'macadamia', name: 'Macadamia' },
    { id: 'brazil-nut', name: 'Brazil Nut' },
    { id: 'pine-nut', name: 'Pine Nut' },
    { id: 'chestnut', name: 'Chestnut' },
  ],
  'peanuts': [
    { id: 'roasted-peanut', name: 'Roasted Peanut' },
    { id: 'peanut-butter', name: 'Peanut Butter' },
    { id: 'peanut-oil', name: 'Peanut Oil' },
    { id: 'boiled-peanut', name: 'Boiled Peanut' },
  ],
  'wheat': [
    { id: 'bread', name: 'Bread' },
    { id: 'pasta', name: 'Pasta' },
    { id: 'flour', name: 'Flour' },
    { id: 'cereal', name: 'Cereal' },
    { id: 'cracker', name: 'Crackers' },
    { id: 'couscous', name: 'Couscous' },
    { id: 'semolina', name: 'Semolina' },
  ],
  'soy': [
    { id: 'soy-milk', name: 'Soy Milk' },
    { id: 'tofu', name: 'Tofu' },
    { id: 'tempeh', name: 'Tempeh' },
    { id: 'edamame', name: 'Edamame' },
    { id: 'soy-sauce', name: 'Soy Sauce' },
    { id: 'miso', name: 'Miso' },
    { id: 'soy-protein', name: 'Soy Protein' },
  ],
  'sesame': [
    { id: 'sesame-seed', name: 'Sesame Seeds' },
    { id: 'tahini', name: 'Tahini' },
    { id: 'sesame-oil', name: 'Sesame Oil' },
    { id: 'hummus', name: 'Hummus' },
    { id: 'halvah', name: 'Halvah' },
  ],
};

export const SYMPTOM_CATEGORIES = {
  skin: ['Hives', 'Rash', 'Eczema flare', 'Swelling', 'Itching'],
  digestive: ['Vomiting', 'Diarrhea', 'Stomach pain', 'Nausea', 'Reflux'],
  respiratory: ['Wheezing', 'Coughing', 'Runny nose', 'Sneezing', 'Difficulty breathing'],
  behavioral: ['Fussiness', 'Poor sleep', 'Refusing food', 'Lethargy'],
} as const;

export type SymptomCategory = keyof typeof SYMPTOM_CATEGORIES;

// Baby Activity Types
export type BabyActivityType = 'sleep' | 'wake' | 'feed' | 'pee' | 'poop';

export type FeedType = 'breast' | 'bottle' | 'solid';

export interface BabyActivity {
  id: string;
  type: BabyActivityType;
  timestamp: string; // ISO string
  notes?: string;
  // Feed-specific
  feedType?: FeedType;
  feedAmount?: string;
  // Sleep-specific (duration calculated when wake is logged)
  duration?: number; // minutes
  createdAt: string;
}

export const ACTIVITY_ICONS: Record<BabyActivityType, { icon: string; label: string; color: string }> = {
  sleep: { icon: '🌙', label: 'Sleep', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  wake: { icon: '☀️', label: 'Wake', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  feed: { icon: '🍼', label: 'Feed', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  pee: { icon: '💧', label: 'Pee', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  poop: { icon: '💩', label: 'Poop', color: 'bg-amber-100 text-amber-700 border-amber-300' },
};

export const FEED_TYPES: { value: FeedType; label: string }[] = [
  { value: 'breast', label: 'Breast' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'solid', label: 'Solid Food' },
];
