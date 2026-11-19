"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, CheckCircle, ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { examService } from "@/lib/data/examService";
import type { Exam, ExamAttempt } from "@/types/database";
import { toast } from "sonner";

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"available" | "all">("available");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const studentId = "33333333-3333-3333-3333-333333333333";
        const [examsData, attemptsData] = await Promise.all([
          examService.getExams("student"),
          examService.getAttemptsByStudent(studentId),
        ]);
        setExams(examsData);
        setAttempts(attemptsData);
      } catch {
        toast.error("Failed to load available examinations.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const now = new Date();

  // Helper to determine status for student
  const getExamStatus = (exam: Exam) => {
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    const attempt = attempts.find((a) => a.exam_id === exam.id);

    if (attempt && attempt.status === "submitted") {
      return { label: "Completed", variant: "success", canAttempt: false, attempt };
    }
    if (attempt && attempt.status === "in_progress") {
      return { label: "In Progress", variant: "warning", canAttempt: true, attempt };
    }
    if (now < start) {
      return { label: "Upcoming", variant: "neutral", canAttempt: false };
    }
    if (now > end) {
      return { label: "Expired", variant: "danger", canAttempt: false };
    }
    return { label: "Available Now", variant: "gold", canAttempt: true };
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "available") {
      const status = getExamStatus(exam);
      return status.canAttempt;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DFC775]/50">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#0B3D2E] tracking-tight">
            Academic Assessment Arena
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Browse published examinations, verify schedules, and complete evaluations within designated time limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/history">
            <Button variant="outline" size="sm">
              My Exam History
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F4EFE2] pb-3">
        <button
          onClick={() => setFilter("available")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            filter === "available"
              ? "bg-[#0B3D2E] text-white shadow-sm"
              : "text-[#5A5A5A] hover:bg-[#F4EFE2]"
          }`}
        >
          Active & Available ({exams.filter((e) => getExamStatus(e).canAttempt).length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            filter === "all"
              ? "bg-[#0B3D2E] text-white shadow-sm"
              : "text-[#5A5A5A] hover:bg-[#F4EFE2]"
          }`}
        >
          All Published ({exams.length})
        </button>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#5A5A5A]">
          Loading available assessments...
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="text-center py-12 px-4 space-y-3">
          <BookOpen className="w-12 h-12 text-[#8C8C8C] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
            No Active Examinations Right Now
          </h3>
          <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
            You do not currently have any unattempted examinations open for submission. Check back as new faculty schedules are published.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <Card
                key={exam.id}
                goldBorder={status.canAttempt}
                className="flex flex-col justify-between hover:shadow-luxury-lg transition-all"
              >
                <CardHeader>
                  <div className="space-y-1">
                    <Badge variant={status.variant as any} dot>
                      {status.label}
                    </Badge>
                    <CardTitle className="text-base line-clamp-1 mt-1">
                      {exam.title}
                    </CardTitle>
                    <CardDescription>{exam.subject}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 flex-1">
                  {exam.description && (
                    <p className="text-xs text-[#5A5A5A] line-clamp-3 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  <div className="space-y-2 pt-2 border-t border-[#F4EFE2] text-xs text-[#5A5A5A]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0B3D2E]" /> Duration
                      </span>
                      <strong className="text-[#0B3D2E]">{exam.duration_minutes} Mins</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#C9A227]" /> Total Marks
                      </span>
                      <strong className="text-[#0B3D2E]">{exam.total_marks} Points</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#166534]" /> Pass Mark
                      </span>
                      <strong>{exam.pass_percentage}%</strong>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 bg-[#FAF7F0] border-t border-[#F4EFE2] rounded-b-xl">
                  {status.attempt && status.attempt.status === "submitted" ? (
                    <Link href={`/student/attempts/${status.attempt.id}/result`} className="w-full block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Result ({status.attempt.score}/{status.attempt.total_marks})
                      </Button>
                    </Link>
                  ) : status.canAttempt ? (
                    <Link href={`/student/exams/${exam.id}/instructions`} className="w-full block">
                      <Button
                        variant="gold"
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="w-full"
                      >
                        {status.attempt ? "Resume Examination" : "Begin Examination"}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" disabled className="w-full">
                      Unavailable
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
