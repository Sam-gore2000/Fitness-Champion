/**
 * One-off seed script for default gamification badges.
 * Run with: node scripts/seedBadges.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('../models/Badge');

const badges = [
  { key: 'week_streak', name: '7-Day Streak', description: 'Completed missions 7 days in a row', icon: '🔥' },
  { key: 'first_workout', name: 'First Rep', description: 'Logged your first workout', icon: '💪' },
  { key: 'protein_master', name: 'Protein Master', description: 'Hit your protein goal 30 times', icon: '🥩' },
  { key: 'early_bird', name: 'Early Bird', description: 'Logged breakfast before 8am 10 times', icon: '🌅' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const b of badges) {
    await Badge.findOneAndUpdate({ key: b.key }, b, { upsert: true });
  }
  console.log(`Seeded ${badges.length} badges`);
  process.exit(0);
})();
