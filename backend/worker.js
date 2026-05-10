// VOKASI2 Background Worker
// Supports: predictive-alerts, decay-competencies, award-badges
// Usage: node worker.js <command>
// Requires DATABASE_URL env var (PostgreSQL connection string)

const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function predictiveAlerts() {
  console.log("[PredictiveAlerts] Checking disengaged students...");
  const client = await pool.connect();
  try {
    // Students active in sandbox >7 days ago but enrolled in active courses
    const result = await client.query(`
      SELECT DISTINCT u.id as user_id, u.full_name, u.email, s.id as sandbox_id
      FROM users u
      JOIN enrollments e ON e.user_id = u.id
      JOIN courses c ON c.id = e.course_id AND c.status = 'published'
      LEFT JOIN sandbox_sessions ss ON ss.user_id = u.id AND ss.status = 'active'
      LEFT JOIN notifications n ON n.user_id = u.id
        AND n.type = 'predictive_disengagement'
        AND n.created_at > NOW() - INTERVAL '3 days'
      WHERE ss.id IS NULL
        AND u.role = 'student'
        AND (
          SELECT MAX(s2.created_at) FROM sandbox_sessions s2 WHERE s2.user_id = u.id
        ) < NOW() - INTERVAL '7 days'
        AND n.id IS NULL
    `);

    let count = 0;
    for (const row of result.rows) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'predictive_disengagement', 'Ayo kembali! 🌱',
                 'Kami perhatikan kamu belum aktif di sandbox selama beberapa hari. Jangan biarkan streak-mu putus!',
                 $2)`,
        [row.user_id, JSON.stringify({ sandbox_id: row.sandbox_id })]
      );
      count++;
    }
    console.log(`[PredictiveAlerts] Sent ${count} disengagement alerts.`);
  } finally {
    client.release();
  }
}

async function decayCompetencies() {
  console.log("[DecayCompetencies] Applying 30-day competency decay...");
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, competency_vector,
             (SELECT MAX(created_at) FROM submissions WHERE user_id = users.id
              UNION ALL
              SELECT MAX(started_at) FROM simulation_sessions WHERE user_id = users.id) as last_activity
      FROM users
      WHERE competency_vector IS NOT NULL
        AND competency_vector::text != '{"0","0","0","0","0","0","0","0","0","0","0","0"}'
    `);

    let count = 0;
    for (const row of result.rows) {
      if (!row.last_activity) continue;
      const lastActivity = new Date(row.last_activity);
      const daysSince = (Date.now() - lastActivity.getTime()) / 86400000;
      if (daysSince < 30) continue;

      // Decay factor: 0.95^(daysSince/30)
      const factor = Math.pow(0.95, daysSince / 30.0);
      const vec = row.competency_vector;
      const decayed = vec.map((v) => Math.max(0, parseFloat(v) * factor));

      await client.query(
        `UPDATE users SET competency_vector = $1::vector, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(decayed), row.id]
      );
      count++;
    }
    console.log(`[DecayCompetencies] Decayed ${count} users.`);
  } finally {
    client.release();
  }
}

async function awardBadges() {
  console.log("[AwardBadges] Checking badge criteria...");
  const client = await pool.connect();
  try {
    const users = await client.query(`SELECT id FROM users`);
    for (const user of users.rows) {
      const uid = user.id;

      // Challenges completed
      const challengeCount = await client.query(
        `SELECT COUNT(*) as cnt FROM submissions
         WHERE user_id = $1 AND status IN ('submitted','evaluated')`,
        [uid]
      );
      const cc = parseInt(challengeCount.rows[0].cnt);

      for (const [badgeName, threshold] of [
        ["Brain Founder", 1], ["Socratic Scholar", 5], ["Socratic Master", 25]
      ]) {
        if (cc >= threshold) {
          await client.query(`
            INSERT INTO user_badges (user_id, badge_id, awarded_at)
            SELECT $1, id, NOW() FROM badges WHERE name = $2
            ON CONFLICT (user_id, badge_id) DO NOTHING`,
            [uid, badgeName]
          );
        }
      }

      // Reflections deep (score >= 7)
      const deepReflections = await client.query(
        `SELECT COUNT(*) as cnt FROM reflections
         WHERE user_id = $1 AND depth_score >= 7`,
        [uid]
      );
      if (parseInt(deepReflections.rows[0].cnt) >= 10) {
        await client.query(`
          INSERT INTO user_badges (user_id, badge_id, awarded_at)
          SELECT $1, id, NOW() FROM badges WHERE name = 'Reflection Pro'
          ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [uid]
        );
      }
    }
    console.log("[AwardBadges] Badge check complete.");
  } finally {
    client.release();
  }
}

const command = process.argv[2] || "help";
console.log(`VOKASI2 Worker running: ${command}`);

const tasks = {
  "predictive-alerts": predictiveAlerts,
  "decay-competencies": decayCompetencies,
  "award-badges": awardBadges,
};

if (tasks[command]) {
  tasks[command]()
    .then(() => { console.log("Done."); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
} else {
  console.log("Commands: predictive-alerts | decay-competencies | award-badges");
  process.exit(0);
}

/**
 * VOKASI2 Background Worker
 * Handles: webhook dispatch, submission evaluation queue, streak resets, badge checks
 */
import { createClient } from "@redis/client";
import { pool } from "./dist/lib/db.js";

const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
await redis.connect();

const QUEUES = {
  EVALUATE: "queue:evaluate",
  WEBHOOK: "queue:webhook",
  NOTIFICATION: "queue:notification",
  BADGE_CHECK: "queue:badge_check",
};

async function processWebhook(job) {
  const { webhookId, event, payload } = job;
  // Implemented in /api/webhooks route — called via DB trigger or direct enqueue
  console.log(`[worker] Dispatching webhook ${webhookId} for event ${event}`);
}

async function processEvaluation(job) {
  const { submissionId } = job;
  console.log(`[worker] Evaluating submission ${submissionId}`);
  // Kimi K2.6 / Claude evaluation pipeline
  // Updates submission.ai_feedback, competency_delta, reasoning_depth_score
}

async function processBadgeCheck(job) {
  const { userId } = job;
  // Run badge criteria checks for user
  // Award badges via user_badges table
}

async function processNotification(job) {
  const { userId, type, title, body, link } = job;
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)`,
    [userId, type, title, body, link]
  );
  console.log(`[worker] Notification sent to user ${userId}: ${title}`);
}

async function processStreakReset() {
  // Daily: reset streak_days to 0 for users who missed yesterday's reflection
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  await pool.query(
    `UPDATE users SET streak_days = 0 WHERE last_reflection_at::date < $1::date AND streak_days > 0`,
    [yesterday]
  );
  console.log("[worker] Streak reset job completed");
}

async function processPeerReviewAssignment() {
  // Assign peer reviews: 3 students per submission after evaluation
  const result = await pool.query(
    `SELECT s.id as submission_id, s.user_id FROM submissions s
     WHERE s.status = 'evaluated'
     AND NOT EXISTS (SELECT 1 FROM peer_review_assignments pra WHERE pra.submission_id = s.id LIMIT 1)
     LIMIT 10`
  );
  for (const row of result.rows) {
    // Find 3 random students who submitted before (not the author)
    const reviewers = await pool.query(
      `SELECT id FROM users WHERE id != $1 AND role = 'student' ORDER BY RANDOM() LIMIT 3`,
      [row.user_id]
    );
    for (const reviewer of reviewers.rows) {
      await pool.query(
        `INSERT INTO peer_review_assignments (submission_id, reviewer_id, deadline_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days') ON CONFLICT (submission_id, reviewer_id) DO NOTHING`,
        [row.submission_id, reviewer.id]
      );
    }
  }
  console.log(`[worker] Peer review assignments: ${result.rows.length} submissions processed`);
}

// Main worker loop
async function run() {
  console.log("[worker] VOKASI2 worker started");

  // Daily cron jobs
  setInterval(processStreakReset, 86400000); // every 24h
  setInterval(processPeerReviewAssignment, 3600000); // every hour

  // Process queues
  while (true) {
    try {
      // Webhook queue
      const webhookJob = await redis.lPop(QUEUES.WEBHOOK);
      if (webhookJob) processWebhook(JSON.parse(webhookJob)).catch(console.error);

      // Evaluation queue
      const evalJob = await redis.lPop(QUEUES.EVALUATE);
      if (evalJob) processEvaluation(JSON.parse(evalJob)).catch(console.error);

      // Notification queue
      const notifJob = await redis.lPop(QUEUES.NOTIFICATION);
      if (notifJob) processNotification(JSON.parse(notifJob)).catch(console.error);

      await new Promise(r => setTimeout(r, 1000)); // 1s polling interval
    } catch (err) {
      console.error("[worker] Error:", err);
      await new Promise(r => setTimeout(r, 5000)); // back off on error
    }
  }
}

run().catch(console.error);
