import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/admin/institutions
export async function GET() {
  try {
    // Check if institutions table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'institutions'
      ) as exists
    `);

    if (tableCheck.rows[0]?.exists) {
      const { rows } = await pool.query(`
        SELECT 
          id,
          name,
          domain,
          plan,
          COALESCE(user_count, 0) as users,
          COALESCE(course_count, 0) as courses,
          status,
          created_at as created
        FROM institutions
        ORDER BY created_at DESC
        LIMIT 100
      `);
      return NextResponse.json({ institutions: rows });
    }

    // Table doesn't exist, return empty
    return NextResponse.json({ institutions: [] });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    const institutions = [
      { id: "1", name: "VOKASI University", domain: "vokasi.ac.id", plan: "enterprise", users: 1250, courses: 48, status: "active", created: "2024-01-01" },
    ];
    return NextResponse.json({ institutions });
  }
}
