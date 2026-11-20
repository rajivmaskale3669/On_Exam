"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamAttempt } from "@/types/database";
import { toast } from "sonner";

export default function SubmissionsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [examData, attemptsData] = await Promise.all([
        examService.getExamById(examId),
        examService.getAttemptsByExam(examId),
      ]);
      setExam(examData);
      setAttempts(attemptsData);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadData();

    // Supabase Realtime subscription for live submission updates
    const supabase = createClient();
    const channel = supabase
      .channel(`submissions-${examId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exam_attempts",
          filter: `exam_id=eq.${examId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [examId, loadData]);

  const totalSubmissions = attempts.filter((a) => a.status === "submitted").length;
  const passedCount = attempts.filter((a) => a.status === "submitted" && a.passed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFC775]/50">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Exams
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
              Candidate Submissions
            </h1>
            <p className="text-xs text-[#5A5A5A] mt-0.5">
              Exam: <strong className="text-[#0B3D2E]">{exam?.title || "Loading..."}</strong> ({exam?.subject || "Assessment"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 bg-[#FCFBF8] border border-[#DFC775] rounded-xl flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0B3D2E]" />
            <span>Submissions: <strong>{totalSubmissions}</strong></span>
          </div>
          <div className="px-3.5 py-1.5 bg-[#E7F2EE] border border-[#BBD5CB] text-[#166534] rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Pass Rate: <strong>{passRate}%</strong></span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Graded Candidate Records</CardTitle>
            <CardDescription>
              All submissions are graded automatically against the official answer keys upon submission. Live updates appear automatically.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Users className="w-12 h-12 text-[#8C8C8C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
                No Candidate Attempts Yet
              </h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Candidate scores will appear here in real time as students submit their exams.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF7F0] border-b border-[#F4EFE2] text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Candidate Name</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Score</th>
                    <th className="px-6 py-3.5">Percentage</th>
                    <th className="px-6 py-3.5">Outcome</th>
                    <th className="px-6 py-3.5">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE2]">
                  {attempts.map((att) => {
                    const pct = att.total_marks > 0 ? Math.round((att.score / att.total_marks) * 100) : 0;
                    return (
                      <tr key={att.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#0B3D2E] block">
                            {att.student?.full_name || "Enrolled Student"}
                          </span>
                          <span className="text-xs text-[#5A5A5A]">
                            {att.student?.email || "Student Account"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              att.status === "submitted"
                                ? "success"
                                : att.status === "in_progress"
                                ? "warning"
                                : "danger"
                            }
                            dot
                          >
                            {att.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0B3D2E]">
                          {att.score} / {att.total_marks}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#5A5A5A]">
                          {pct}%
                        </td>
                        <td className="px-6 py-4">
                          {att.status === "submitted" ? (
                            <Badge variant={att.passed ? "success" : "danger"}>
                              {att.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-[#8C8C8C]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#5A5A5A]">
                          {att.submitted_at
                            ? new Date(att.submitted_at).toLocaleString()
                            : "Session in progress"}
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
