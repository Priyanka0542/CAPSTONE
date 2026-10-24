/**
 * One-time backfill script: recompute goalSlug for all existing CareerPath
 * documents using the canonical getGoalKey() function.
 *
 * Usage:
 *   node server/scripts/backfillGoalSlugs.js
 *
 * Requires MONGO_URI in server/.env (or set as env variable).
 */

const mongoose = require('mongoose');
const path = require('path');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CareerPath = require('../models/CareerPath');
const { getGoalKey } = require('../utils/goalKey');

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI not found in environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  // Fetch ALL paths (including deleted) so slugs stay consistent
  const paths = await CareerPath.find({}).setOptions({ includeDeleted: true });
  console.log(`Found ${paths.length} career paths to backfill.`);

  let updated = 0;
  let skipped = 0;

  for (const p of paths) {
    const newSlug = getGoalKey(p.goalTitle);
    if (newSlug && newSlug !== p.goalSlug) {
      p.goalSlug = newSlug;
      await p.save({ validateBeforeSave: false });
      updated++;
      console.log(`  ✓ "${p.goalTitle}" → ${newSlug}`);
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Unchanged: ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
