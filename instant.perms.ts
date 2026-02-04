// instant.perms.ts
// Open access permissions - all operations allowed without authentication
// WARNING: This is not recommended for production use

const rules = {
  allergens: {
    allow: { view: 'true', create: 'true', update: 'true', delete: 'true' },
  },
  foodTrials: {
    allow: { view: 'true', create: 'true', update: 'true', delete: 'true' },
  },
  reactions: {
    allow: { view: 'true', create: 'true', update: 'true', delete: 'true' },
  },
  babyActivities: {
    allow: { view: 'true', create: 'true', update: 'true', delete: 'true' },
  },
};

export default rules;
