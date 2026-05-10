"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, Trophy, BrainCircuit, Loader2 } from "lucide-react";

interface OverviewData {
  totalUsers: number;
  totalCourses: number;
  totalChallenges: number;
  activeSimulations: number;
}

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchOverview() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch("/api/admin/analytics/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setOverview(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [token]);

  const metrics = [
    {
      label: "Total Users",
      value: overview?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Courses",
      value: overview?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Challenges",
      value: overview?.totalChallenges ?? 0,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Active Simulations",
      value: overview?.activeSimulations ?? 0,
      icon: BrainCircuit,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome{user?.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s an overview of your VOKASI2 platform
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          Unable to load dashboard data. Please try again later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className="bg-slate-900 border-slate-800 ring-0"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {m.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {m.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
