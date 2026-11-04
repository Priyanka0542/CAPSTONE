/**
 * One-time / on-demand backfill script: recomputes canonical goalSlug
 * for all CareerPath and CommunityMessage documents using getGoalKey().
 *
 * Usage:
 *   node server/scripts/backfillGoalSlugs.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { migrateCanonicalSlugs } = require('../utils/migrateSlugs');

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/futureera';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const result = await migrateCanonicalSlugs();
  console.log('Backfill result:', result);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
