import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/admin/users
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id, 
        full_name as name, 
        email, 
        role, 
        COALESCE(status, 'active') as status,
        created_at as joined,
        updated_at as "lastActive"
      FROM users 
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    // Fallback to mock data
    const users = [
      { id: "1", name: "Budi Santoso", email: "student@vokasi.id", role: "student", status: "active", joined: "2024-01-15", lastActive: "2024-01-20" },
      { id: "2", name: "Test Instructor", email: "instructor@vokasi.id", role: "instructor", status: "active", joined: "2024-01-10", lastActive: "2024-01-19" },
      { id: "3", name: "Dr. Siti Rahayu", email: "mentor@vokasi.id", role: "mentor", status: "active", joined: "2024-01-12", lastActive: "2024-01-18" },
      { id: "4", name: "Admin VOKASI", email: "admin@vokasi.id", role: "admin", status: "active", joined: "2024-01-01", lastActive: "2024-01-20" },
    ];
    return NextResponse.json({ users });
  }
}
