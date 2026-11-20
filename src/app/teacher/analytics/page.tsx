"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, CheckCircle, XCircle, Users, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<{
    totalExams: number;
    publishedExams: number;
    totalSubmissions: number;
    passedSubmissions: number;
    failedSubmissions: number;
    averagePercentage: number;
    passRate: number;
    exams: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to access analytics.");
          setLoading(false);
          return;
        }
        const stats = await examService.getTeacherAnalytics(user.id);
        setData(stats);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="pb-4 border-b border-[#DFC775]/50">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#DFC775]/50">
        <h1 className="font-serif text-3xl font-bold text-[#0B3D2E]">
          Performance & Cohort Analytics
        </h1>
        <p className="text-sm text-[#5A5A5A] mt-1">
          Comprehensive metric analysis across all your authored examinations.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card goldBorder>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                  Total Submissions
                </p>
                <p className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
                  {data?.totalSubmissions || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#0B3D2E] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                  Pass Rate
                </p>
                <p className="font-serif text-3xl font-bold text-[#166534] mt-1">
                  {data?.passRate || 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#166534] flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                  Mean Percentage
                </p>
                <p className="font-serif text-3xl font-bold text-[#C9A227] mt-1">
                  {data?.averagePercentage || 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FDF4D4] text-[#A68218] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                  Active Exams
                </p>
                <p className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
                  {data?.publishedExams || 0} / {data?.totalExams || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#0B3D2E] border border-[#DFC775] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pass / Fail Visual Distribution */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pass / Fail Distribution</CardTitle>
              <CardDescription>
                Proportion of candidates satisfying course mastery criteria
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#166534] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Passed ({data?.passedSubmissions || 0})
                </span>
                <span className="text-[#8B1E1E] flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Failed ({data?.failedSubmissions || 0})
                </span>
              </div>

              {/* Luxury Progress Bar */}
              <div className="h-4 w-full bg-[#FBEBEB] rounded-full overflow-hidden flex border border-[#E5E1D8]">
                <div
                  style={{ width: `${data?.passRate || 0}%` }}
                  className="bg-[#166534] transition-all duration-500"
                />
                <div
                  style={{ width: `${100 - (data?.passRate || 0)}%` }}
                  className="bg-[#8B1E1E] transition-all duration-500"
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#5A5A5A] pt-1">
                <span>{data?.passRate || 0}% Satisfied Passing Bar</span>
                <span>{100 - (data?.passRate || 0)}% Retake Required</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#DFC775]/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E]">
                Cohort Quality Note
              </h4>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                {data && data.totalSubmissions > 0
                  ? `Based on ${data.totalSubmissions} live student submission${data.totalSubmissions > 1 ? "s" : ""}, the overall pass rate stands at ${data.passRate}%.`
                  : "No submissions have been recorded yet. Real-time statistics will populate dynamically when candidates submit attempts."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Exams Breakdown List */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Assessment Inventory</CardTitle>
              <CardDescription>
                Overview of published versus draft syllabus tests
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!data?.exams || data.exams.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A5A5A]">
                No exams created yet.
              </div>
            ) : (
              <div className="divide-y divide-[#F4EFE2]">
                {data.exams.map((exam) => (
                  <div key={exam.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0B3D2E]">{exam.title}</p>
                      <p className="text-xs text-[#5A5A5A]">{exam.subject} • {exam.duration_minutes} Mins</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#C9A227] block">
                        {exam.total_marks} Marks
                      </span>
                      <span className="text-[11px] text-[#5A5A5A]">
                        Pass: {exam.pass_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
