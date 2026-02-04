import { init, id } from '@instantdb/react';
import schema from '../../instant.schema';
import { BIG_9_ALLERGENS, ALLERGEN_SUB_ITEMS } from '../types';

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID;

if (!APP_ID) {
  throw new Error(
    'VITE_INSTANT_APP_ID is required. Please create a .env file with VITE_INSTANT_APP_ID=your-app-id'
  );
}

export const db = init({ appId: APP_ID, schema });
export { id };

// Seed Big 9 allergens and their sub-items if database is empty
export async function seedAllergens() {
  const { data } = await db.queryOnce({ allergens: {} });

  if (data.allergens.length === 0) {
    const txns = [];

    // Add Big 9 parent allergens
    for (const allergen of BIG_9_ALLERGENS) {
      txns.push(
        db.tx.allergens[allergen.id].update({
          name: allergen.name,
          isCustom: false,
          icon: allergen.icon,
        })
      );
    }

    // Add sub-items for each parent allergen
    for (const [parentId, subItems] of Object.entries(ALLERGEN_SUB_ITEMS)) {
      for (const sub of subItems) {
        txns.push(
          db.tx.allergens[sub.id].update({
            name: sub.name,
            isCustom: false,
            icon: sub.icon,
            parentId,
          })
        );
      }
    }

    await db.transact(txns);
  }
}
