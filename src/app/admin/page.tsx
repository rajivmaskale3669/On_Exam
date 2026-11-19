"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  UserCheck,
  UserX,
  ArrowRight,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { examService } from "@/lib/data/examService";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    activeUsers: number;
    totalExams: number;
    publishedExams: number;
    totalAttempts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await examService.getAdminPlatformStats();
        setStats(data);
      } catch {
        toast.error("Failed to load platform analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DFC775]/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F2EE] border border-[#BBD5CB] text-[#166534] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Institutional Governance
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0B3D2E] tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Global governance over examinations, faculty course offerings, candidate access, and platform integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="gold" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Manage Accounts
            </Button>
          </Link>
          <Link href="/admin/exams">
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
              Oversee Exams
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Total Registered Users
              </p>
              <p className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#0B3D2E] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Enrolled Students
              </p>
              <p className="font-serif text-3xl font-bold text-[#166534] mt-1">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#166534] flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Active Faculty / Examiners
              </p>
              <p className="font-serif text-3xl font-bold text-[#0E2A47] mt-1">
                {stats?.totalTeachers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#0E2A47] border border-[#DFC775] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Total Exam Attempts
              </p>
              <p className="font-serif text-3xl font-bold text-[#C9A227] mt-1">
                {stats?.totalAttempts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FDF4D4] text-[#A68218] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card goldBorder>
          <CardHeader>
            <div>
              <CardTitle>User Governance & Access Control</CardTitle>
              <CardDescription>
                View all registered faculty and candidates, inspect permissions, and activate or suspend accounts.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Suspended accounts immediately forfeit exam taking and grading capabilities. Suspensions are logged and enforced via Supabase Row Level Security and Edge Middleware.
            </p>
            <div className="pt-2">
              <Link href="/admin/users">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open User Management Console
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardHeader>
            <div>
              <CardTitle>Global Examination Oversight</CardTitle>
              <CardDescription>
                Inspect syllabi, audit question banks, and review live candidate submission records.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Oversee all {stats?.totalExams || 0} authored examinations ({stats?.publishedExams || 0} published) across all academic departments.
            </p>
            <div className="pt-2">
              <Link href="/admin/exams">
                <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Inspect All Departmental Exams
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
