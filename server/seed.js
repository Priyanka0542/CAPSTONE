/**
 * seed.js — Initialize the FutureEra MongoDB database
 *
 * Creates all collections, indexes, and optionally inserts sample data
 * so you can explore the app immediately after setup.
 *
 * Usage:
 *   node seed.js              — Create DB + collections + indexes only
 *   node seed.js --sample     — Also insert sample user + career path data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');

// Import all models (this registers schemas & creates collections on first access)
const User = require('./models/User');
const CareerPath = require('./models/CareerPath');
const DailyActivity = require('./models/DailyActivity');
const StreakLog = require('./models/StreakLog');
const Badge = require('./models/Badge');

const insertSampleData = process.argv.includes('--sample');

async function seed() {
  try {
    // ── Connect to MongoDB ──────────────────────────────────────────
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);
    console.log(`📦 Database: ${mongoose.connection.name}\n`);

    // ── Ensure all collections exist ────────────────────────────────
    const db = mongoose.connection.db;
    const existingCollections = (await db.listCollections().toArray()).map(
      (c) => c.name
    );

    const requiredCollections = [
      'users',
      'careerpaths',
      'dailyactivities',
      'streaklogs',
      'badges',
    ];

    for (const col of requiredCollections) {
      if (existingCollections.includes(col)) {
        console.log(`  ✔ Collection "${col}" already exists`);
      } else {
        await db.createCollection(col);
        console.log(`  ✨ Created collection "${col}"`);
      }
    }

    // ── Sync indexes for every model ────────────────────────────────
    console.log('\n📇 Syncing indexes...');
    await User.syncIndexes();
    console.log('  ✔ User indexes synced');
    await CareerPath.syncIndexes();
    console.log('  ✔ CareerPath indexes synced');
    await DailyActivity.syncIndexes();
    console.log('  ✔ DailyActivity indexes synced');
    await StreakLog.syncIndexes();
    console.log('  ✔ StreakLog indexes synced');
    await Badge.syncIndexes();
    console.log('  ✔ Badge indexes synced');

    // ── Print index summary ─────────────────────────────────────────
    console.log('\n📋 Index summary:');
    for (const modelName of ['User', 'CareerPath', 'DailyActivity', 'StreakLog', 'Badge']) {
      const model = mongoose.model(modelName);
      const indexes = await model.collection.indexes();
      console.log(`  ${modelName}:`);
      indexes.forEach((idx) => {
        const fields = Object.keys(idx.key).join(', ');
        const unique = idx.unique ? ' (unique)' : '';
        console.log(`    - ${idx.name}: { ${fields} }${unique}`);
      });
    }

    // ── Insert sample data (optional) ───────────────────────────────
    if (insertSampleData) {
      console.log('\n🌱 Inserting sample data...');

      // Check if sample user already exists
      const existingUser = await User.findOne({ email: 'demo@futureera.com' });
      if (existingUser) {
        console.log('  ⚠ Sample user already exists — skipping sample data.');
      } else {
        // Create sample user
        const sampleUser = await User.create({
          name: 'Demo User',
          email: 'demo@futureera.com',
          passwordHash: 'DemoPass123!', // Will be hashed by the pre-save hook
          currentStreak: 3,
          longestStreak: 7,
          lastActiveDate: new Date(),
        });
        console.log(`  ✔ Created sample user: ${sampleUser.email}`);

        // Create sample career path
        const samplePath = await CareerPath.create({
          userId: sampleUser._id,
          goalTitle: 'Become a Full-Stack Developer',
          status: 'active',
          estimatedMonths: 12,
          estimatedCostINR: 25000,
          estimatedOutcomeSalaryINR: 800000,
          riskLevel: 'medium',
          assumptions:
            'Assumes 3-4 hours of daily study, prior basic programming knowledge, and access to a laptop with internet.',
          userProfile: {
            age: 22,
            degree: 'B.Tech Computer Science',
            budget: 25000,
            country: 'India',
          },
          roadmap: [
            {
              month: 1,
              milestone: 'HTML, CSS & JavaScript Fundamentals',
              tasks: [
                'Complete freeCodeCamp Responsive Web Design',
                'Build 3 static web pages from scratch',
                'Learn CSS Flexbox and Grid',
                'JavaScript variables, loops, functions',
              ],
              completed: true,
            },
            {
              month: 2,
              milestone: 'Advanced JavaScript & DOM Manipulation',
              tasks: [
                'Learn ES6+ features (arrow functions, destructuring, modules)',
                'Build an interactive to-do app',
                'Understand async/await and Promises',
                'Practice with 20 LeetCode easy problems',
              ],
              completed: true,
            },
            {
              month: 3,
              milestone: 'React.js Fundamentals',
              tasks: [
                'Learn React components, props, state',
                'Build a weather app with API integration',
                'Understand React Router for navigation',
                'Learn useEffect and custom hooks',
              ],
              completed: false,
            },
            {
              month: 4,
              milestone: 'Node.js & Express Backend',
              tasks: [
                'Learn Node.js basics and npm',
                'Build REST APIs with Express',
                'Implement authentication with JWT',
                'Connect to MongoDB with Mongoose',
              ],
              completed: false,
            },
            {
              month: 5,
              milestone: 'Database Design & MongoDB',
              tasks: [
                'Learn MongoDB CRUD operations',
                'Design schemas for a blog application',
                'Implement data validation with Mongoose',
                'Learn aggregation pipeline basics',
              ],
              completed: false,
            },
            {
              month: 6,
              milestone: 'Full-Stack Project #1',
              tasks: [
                'Build a full-stack blog platform',
                'Implement user auth, CRUD posts, comments',
                'Deploy to Vercel (frontend) + Render (backend)',
                'Write API documentation',
              ],
              completed: false,
            },
            {
              month: 7,
              milestone: 'Testing & DevOps Basics',
              tasks: [
                'Learn Jest for unit testing',
                'Write integration tests for APIs',
                'Set up CI/CD with GitHub Actions',
                'Learn Docker basics',
              ],
              completed: false,
            },
            {
              month: 8,
              milestone: 'Advanced React & State Management',
              tasks: [
                'Learn Redux Toolkit or Zustand',
                'Implement complex form handling',
                'Performance optimization (React.memo, useMemo)',
                'Build a real-time chat feature with Socket.io',
              ],
              completed: false,
            },
            {
              month: 9,
              milestone: 'TypeScript & Code Quality',
              tasks: [
                'Learn TypeScript fundamentals',
                'Migrate a project to TypeScript',
                'Set up ESLint and Prettier',
                'Learn design patterns for web apps',
              ],
              completed: false,
            },
            {
              month: 10,
              milestone: 'Full-Stack Project #2 (Capstone)',
              tasks: [
                'Plan and design a complex SaaS application',
                'Implement payment integration (Razorpay/Stripe)',
                'Add role-based access control',
                'Build admin dashboard',
              ],
              completed: false,
            },
            {
              month: 11,
              milestone: 'Portfolio & Open Source',
              tasks: [
                'Build a personal portfolio website',
                'Contribute to 2 open source projects',
                'Write technical blog posts',
                'Optimize all projects for performance',
              ],
              completed: false,
            },
            {
              month: 12,
              milestone: 'Job Preparation & Applications',
              tasks: [
                'Prepare resume with project highlights',
                'Practice DSA (50 medium LeetCode problems)',
                'Mock interviews (system design + coding)',
                'Apply to 50+ companies',
              ],
              completed: false,
            },
          ],
          monthsElapsed: 2,
        });
        console.log(`  ✔ Created sample career path: "${samplePath.goalTitle}"`);

        // Set focus path
        sampleUser.focusPathId = samplePath._id;
        await sampleUser.save();

        // Create sample daily activities
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          activities.push({
            userId: sampleUser._id,
            careerPathId: samplePath._id,
            date,
            taskDescription: [
              'Completed React Router tutorial and built navigation',
              'Practiced 5 JavaScript coding problems on LeetCode',
              'Built a responsive landing page with CSS Grid',
              'Watched Node.js crash course and took notes',
              'Reviewed ES6 destructuring and spread operator',
            ][i],
            completed: i > 0, // today's task not yet completed
          });
        }
        await DailyActivity.insertMany(activities);
        console.log(`  ✔ Created ${activities.length} sample daily activities`);

        // Create streak logs
        const streakLogs = [];
        for (let i = 1; i <= 3; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          streakLogs.push({
            userId: sampleUser._id,
            date,
            active: true,
          });
        }
        await StreakLog.insertMany(streakLogs);
        console.log(`  ✔ Created ${streakLogs.length} streak log entries`);

        // Create sample badges
        const badges = await Badge.insertMany([
          {
            userId: sampleUser._id,
            badgeType: 'first-milestone',
            earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            userId: sampleUser._id,
            badgeType: '7-day-streak',
            earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
        ]);
        sampleUser.totalBadgesEarned = badges.map((b) => b._id);
        await sampleUser.save();
        console.log(`  ✔ Created ${badges.length} sample badges`);

        console.log('\n  📧 Sample login credentials:');
        console.log('     Email:    demo@futureera.com');
        console.log('     Password: DemoPass123!');
      }
    }

    // ── Final summary ───────────────────────────────────────────────
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Database setup complete!');
    console.log('═'.repeat(50));
    console.log(`\n  Database:    ${mongoose.connection.name}`);
    console.log(`  Host:        ${mongoose.connection.host}`);
    console.log(`  Collections: ${requiredCollections.length}`);

    const counts = {};
    for (const col of requiredCollections) {
      counts[col] = await db.collection(col).countDocuments();
    }
    console.log('\n  Document counts:');
    for (const [col, count] of Object.entries(counts)) {
      console.log(`    ${col}: ${count}`);
    }

    if (!insertSampleData) {
      console.log('\n  💡 Tip: Run "node seed.js --sample" to insert demo data.');
    }

    console.log('');
  } catch (error) {
    console.error(`\n❌ Seed error: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seed();
