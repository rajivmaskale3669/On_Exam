"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import type { ExamAttempt } from "@/types/database";
import { toast } from "sonner";

export default function StudentResultsPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to view your results.");
          setLoading(false);
          return;
        }
        const data = await examService.getAttemptsByStudent(user.id);
        setAttempts(data.filter((a) => a.status === "submitted"));
      } catch (err: any) {
        toast.error(err?.message || "Failed to load results summary.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCompleted = attempts.length;
  const passedTotal = attempts.filter((a) => a.passed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedTotal / totalCompleted) * 100) : 0;
  const overallAvg =
    totalCompleted > 0
      ? Math.round(
          attempts.reduce(
            (sum, a) => sum + (a.score / (a.total_marks || 1)) * 100,
            0
          ) / totalCompleted
        )
      : 0;

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#DFC775]/50 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#0B3D2E]">
            Academic Performance Transcripts
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Aggregated metrics, passing ratios, and official score summaries.
          </p>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Exams Completed
              </p>
              {loading ? (
                <Skeleton className="h-9 w-12 mt-1" />
              ) : (
                <p className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
                  {totalCompleted}
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#0B3D2E] border border-[#DFC775] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Average Score
              </p>
              {loading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <p className="font-serif text-3xl font-bold text-[#C9A227] mt-1">
                  {overallAvg}%
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FDF4D4] text-[#A68218] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider">
                Success Rate
              </p>
              {loading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <p className="font-serif text-3xl font-bold text-[#166534] mt-1">
                  {passRate}%
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#166534] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table of all results */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Graded Test Roster</CardTitle>
            <CardDescription>
              Official scores for every concluded assessment.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Award className="w-12 h-12 text-[#8C8C8C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
                No Graded Results Found
              </h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Take an examination from the student catalog to build your transcript.
              </p>
              <Link href="/student">
                <Button variant="primary" size="sm">
                  Go to Exams
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF7F0] border-b border-[#F4EFE2] text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Course Exam</th>
                    <th className="px-6 py-3.5">Points</th>
                    <th className="px-6 py-3.5">Percentage</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE2]">
                  {attempts.map((att) => {
                    const pct =
                      att.total_marks > 0
                        ? Math.round((att.score / att.total_marks) * 100)
                        : 0;
                    return (
                      <tr key={att.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#0B3D2E] block">
                            {att.exam?.title}
                          </span>
                          <span className="text-xs text-[#5A5A5A]">
                            {att.exam?.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0B3D2E]">
                          {att.score} / {att.total_marks}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#5A5A5A]">
                          {pct}%
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={att.passed ? "success" : "danger"}>
                            {att.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#5A5A5A]">
                          {att.submitted_at
                            ? new Date(att.submitted_at).toLocaleDateString()
                            : "Recent"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/student/attempts/${att.id}/result`}>
                            <Button variant="ghost" size="sm">
                              Scorecard
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
