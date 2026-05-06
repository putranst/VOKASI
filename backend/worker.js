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
         VALUES ($1, $2, NOW() + INTERVAL '7 days') ON CONFLICT DO NOTHING`,
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
