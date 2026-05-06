// CRUD for webhook subscriptions
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import crypto from "crypto";

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliverWebhook(webhookId: string, event: string, payload: object) {
  try {
    const whRes = await pool.query(
      `SELECT * FROM webhooks WHERE id = $1 AND is_active = true`, [webhookId]
    );
    if (!whRes.rows.length) return;
    const wh = whRes.rows[0];

    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
    const sig = sign(body, wh.secret);

    const res = await fetch(wh.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VOKASI-Signature": sig,
        "X-VOKASI-Event": event,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event, payload, response_status, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [webhookId, event, body, res.status, res.ok ? "success" : "failed"]
    );

    if (res.ok) {
      await pool.query(`UPDATE webhooks SET failure_count = 0, last_success_at = NOW() WHERE id = $1`, [webhookId]);
    } else {
      await pool.query(
        `UPDATE webhooks SET failure_count = failure_count + 1, last_failure_at = NOW() WHERE id = $1`,
        [webhookId]
      );
    }
  } catch (err) {
    console.error(`Webhook delivery failed for ${webhookId}:`, err);
    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event, payload, status)
       VALUES ($1, $2, $3, 'failed')`,
      [webhookId, event, JSON.stringify(payload)]
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userRes = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`, [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await pool.query(
      `SELECT id, name, url, events, is_active, failure_count, last_success_at, last_failure_at, created_at
       FROM webhooks ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userRes = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`, [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, url, events, headers } = await req.json();
    if (!name || !url || !events?.length) {
      return NextResponse.json({ error: "name, url, and events are required" }, { status: 400 });
    }

    const secret = crypto.randomBytes(32).toString("hex");
    const result = await pool.query(
      `INSERT INTO webhooks (name, url, events, secret, headers)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, url, events, is_active, created_at`,
      [name, url, events, secret, JSON.stringify(headers ?? {})]
    );
    return NextResponse.json({ ...result.rows[0], secret }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userRes = await pool.query(
      `SELECT u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`, [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get("id");
    if (!webhookId) return NextResponse.json({ error: "id required" }, { status: 400 });

    await pool.query(`DELETE FROM webhooks WHERE id = $1`, [webhookId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
