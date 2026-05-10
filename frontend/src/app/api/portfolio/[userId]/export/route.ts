// GET /api/portfolio/[userId]/export?format=pdf|json
// Exports portfolio as downloadable PDF (via HTML→PDF) or JSON
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import puppeteer from 'puppeteer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "json";

    // Authorization: owner or admin
    if (token) {
      const userResult = await pool.query(
        `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
        [token]
      );
      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const me = userResult.rows[0];
      if (me.id !== userId && me.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // Public portfolio check
      const pubCheck = await pool.query(
        `SELECT is_public FROM portfolios WHERE user_id = $1`,
        [userId]
      );
      if (pubCheck.rows.length === 0 || !pubCheck.rows[0].is_public) {
        return NextResponse.json({ error: "Not found or private" }, { status: 404 });
      }
    }

    // Fetch portfolio + user data
    const result = await pool.query(
      `SELECT p.*, u.full_name, u.email
       FROM portfolios p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const portfolio = result.rows[0];

    if (format === "json") {
      const export_data = {
        exported_at: new Date().toISOString(),
        student: portfolio.full_name,
        email: portfolio.email,
        competency_heatmap: portfolio.competency_heatmap,
        artifacts: portfolio.artifacts,
        failure_resume: portfolio.failure_resume,
        endorsements: portfolio.endorsements,
        portfolio_url: `https://vokasi.ai/portfolio/${portfolio.public_url_slug}`,
      };
      return new NextResponse(JSON.stringify(export_data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="portfolio-${portfolio.public_url_slug}.json"`,
        },
      });
    }

    // PDF format — generate PDF from HTML using Puppeteer
    const heatmap = portfolio.competency_heatmap as Record<string, number>;
    const competencyRows = Object.entries(heatmap ?? {}).map(
      ([key, val]) => `<tr><td>${key}</td><td><div style="background:#064e3b;width:${val}%;height:20px;border-radius:4px;"></div>${val}/100</td></tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Portfolio - ${portfolio.full_name}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1f2937}
  h1{color:#064e3b;border-bottom:2px solid #064e3b;padding-bottom:8px}
  h2{color:#064e3b;margin-top:32px}
  .badge{display:inline-block;padding:4px 12px;background:#d1fae5;color:#065f46;border-radius:999px;font-size:13px;margin:4px}
  table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left}
  @media print{body{margin:0}.page-break{page-break-before:always}}
</style></head><body>
<h1>Portfolio Kompetensi</h1>
<p><strong>${portfolio.full_name}</strong> &lt;${portfolio.email}&gt;</p>
<p>URL: <a href="https://vokasi.ai/portfolio/${portfolio.public_url_slug}">vokasi.ai/portfolio/${portfolio.public_url_slug}</a></p>

<h2>12-Dimensional Competency Heatmap</h2>
<table><thead><tr><th>Kompetensi</th><th>Skor (0-100)</th></tr></thead><tbody>${competencyRows}</tbody></table>

<h2>Artifacts</h2>
${(portfolio.artifacts as unknown[] ?? []).map((a: Record<string,unknown>) => `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px">
  <strong>${a.title}</strong> <span style="color:#64748b">— ${a.type}</span>
  <p>${a.description ?? ""}</p>
</div>`).join("")}

<h2>Failure Resume</h2>
<p style="color:#64748b;font-style:italic">Mempertanyakan kegagalan sebagai alat pembelajaran</p>
${(portfolio.failure_resume as unknown[] ?? []).slice(0,5).map((f: Record<string,unknown>) => `<div style="border-left:3px solid #f43f5e;padding-left:12px;margin:12px 0">
  <p><strong>Apa yang salah:</strong> ${f.whatWentWrong ?? "-"}</p>
  <p><strong>Yang dipelajari:</strong> ${f.whatILearned ?? "-"}</p>
</div>`).join("")}

<h2>Endorsements</h2>
${((portfolio.endorsements as unknown[] ?? []) as Record<string,unknown>[]).length > 0
  ? (portfolio.endorsements as Record<string,unknown>[]).map((e: Record<string,unknown>) => `<span class="badge">${e.endorser_name ?? "Mentor"}</span>`).join("")
  : "<p>Belum ada endorsement.</p>"}

<footer style="margin-top:48px;color:#94a3b8;font-size:12px">
  Dicetak dari VOKASI Platform — ${new Date().toLocaleDateString("id-ID")}
</footer></body></html>`;

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="portfolio-${portfolio.public_url_slug}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
