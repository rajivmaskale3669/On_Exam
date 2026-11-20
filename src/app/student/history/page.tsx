"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Award, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import type { ExamAttempt } from "@/types/database";
import { toast } from "sonner";

export default function ExamHistoryPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to view your history.");
          setLoading(false);
          return;
        }
        const data = await examService.getAttemptsByStudent(user.id);
        setAttempts(data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load attempt history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#DFC775]/50 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#0B3D2E]">
            Examination History & Transcripts
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Complete archive of your historical evaluations, scores, and performance transcripts.
          </p>
        </div>
        <Link href="/student">
          <Button variant="primary" size="sm">
            Active Examinations
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historical Attempts Record</CardTitle>
            <CardDescription>
              Each attempt contains an official reviewable item breakdown and date timestamp.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <History className="w-12 h-12 text-[#8C8C8C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
                No Completed Examinations Yet
              </h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Once you complete your first examination, your scores and review sheets will be permanently cataloged here.
              </p>
              <Link href="/student">
                <Button variant="gold" size="sm">
                  View Available Tests
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE2]">
              {attempts.map((att) => {
                const pct = att.total_marks > 0 ? Math.round((att.score / att.total_marks) * 100) : 0;
                return (
                  <div
                    key={att.id}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F0]/60 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-lg font-bold text-[#0B3D2E]">
                          {att.exam?.title || "Examination Assessment"}
                        </span>
                        <Badge variant={att.passed ? "success" : "danger"}>
                          {att.passed ? "PASSED" : "FAILED"}
                        </Badge>
                        <Badge variant="neutral">{att.exam?.subject || "Core"}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A5A5A] pt-1">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                          Score: <strong>{att.score} / {att.total_marks}</strong> ({pct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0B3D2E]" />
                          Submitted: {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Link href={`/student/attempts/${att.id}/result`}>
                        <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                          View Full Scorecard
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
