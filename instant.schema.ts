// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
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
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
