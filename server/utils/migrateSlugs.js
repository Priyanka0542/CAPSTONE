const mongoose = require('mongoose');
const { getGoalKey } = require('./goalKey');

/**
 * Idempotently migrates CareerPath and CommunityMessage documents to canonical goalSlugs.
 * Safe to run on every startup; will only touch documents whose slug doesn't match canonical.
 */
async function migrateCanonicalSlugs() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return { pathsUpdated: 0, messagesUpdated: 0 };
    }

    const pathsCollection = db.collection('careerpaths');
    const paths = await pathsCollection.find({}).toArray();
    let pathsUpdated = 0;

    for (const p of paths) {
      if (!p.goalTitle) continue;
      const canonical = getGoalKey(p.goalTitle);
      if (canonical && canonical !== p.goalSlug) {
        await pathsCollection.updateOne(
          { _id: p._id },
          { $set: { goalSlug: canonical } }
        );
        pathsUpdated++;
      }
    }

    const messagesCollection = db.collection('communitymessages');
    const messages = await messagesCollection.find({}).toArray();
    let messagesUpdated = 0;

    for (const m of messages) {
      if (!m.goalSlug) continue;
      const canonical = getGoalKey(m.goalSlug);
      if (canonical && canonical !== m.goalSlug) {
        await messagesCollection.updateOne(
          { _id: m._id },
          { $set: { goalSlug: canonical } }
        );
        messagesUpdated++;
      }
    }

    if (pathsUpdated > 0 || messagesUpdated > 0) {
      console.log(`[Migration] Migrated ${pathsUpdated} paths and ${messagesUpdated} messages to canonical goalSlugs.`);
    }

    return { pathsUpdated, messagesUpdated };
  } catch (error) {
    console.error('[Migration] Failed to migrate canonical slugs:', error.message);
    return { pathsUpdated: 0, messagesUpdated: 0, error: error.message };
  }
}

module.exports = { migrateCanonicalSlugs };
