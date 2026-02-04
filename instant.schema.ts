// instant.schema.ts
import { i } from '@instantdb/react';

const schema = i.schema({
  entities: {
    allergens: i.entity({
      name: i.string(),
      isCustom: i.boolean(),
      icon: i.string().optional(),
      parentId: i.string().optional(),
    }),
    foodTrials: i.entity({
      foodName: i.string(),
      allergenIds: i.json<string[]>(),
      date: i.string(),
      amount: i.string().optional(),
      notes: i.string().optional(),
      createdAt: i.string(),
    }),
    reactions: i.entity({
      foodTrialId: i.string(),
      symptoms: i.json<string[]>(),
      severity: i.string(),
      minutesAfterExposure: i.number(),
      photos: i.json<string[]>().optional(),
      notes: i.string().optional(),
      createdAt: i.string(),
    }),
    babyActivities: i.entity({
      type: i.string(),
      timestamp: i.string(),
      notes: i.string().optional(),
      feedType: i.string().optional(),
      feedAmount: i.string().optional(),
      duration: i.number().optional(),
      createdAt: i.string(),
    }),
  },
});

export default schema;
export type Schema = typeof schema;
