"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Share2,
  FileText,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { examService } from "@/lib/data/examService";
import type { ExamAttempt, Question, StudentAnswer } from "@/types/database";
import { toast } from "sonner";

export default function ExamResultPage() {
  const params = useParams();
  const attemptId = params.id as string;

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      setLoading(true);
      try {
        const attemptData = await examService.getAttemptById(attemptId);
        if (attemptData) {
          setAttempt(attemptData);
          const [qData, ansData] = await Promise.all([
            examService.getQuestions(attemptData.exam_id),
            examService.getStudentAnswersForAttempt(attemptId),
          ]);
          setQuestions(qData);
          setStudentAnswers(ansData);
        } else {
          toast.error("Result record not found.");
        }
      } catch {
        toast.error("Failed to load result.");
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="text-center py-24 text-[#5A5A5A]">
        Retrieving official scorecard...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">
          Scorecard Not Found
        </h2>
        <Link href="/student">
          <Button variant="primary">Return to Student Portal</Button>
        </Link>
      </div>
    );
  }

  const score = attempt.score;
  const totalMarks = attempt.total_marks || 100;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const isPassed = attempt.passed;

  // Breakdown
  const totalQuestions = questions.length;
  const answeredCount = studentAnswers.filter((a) => a.selected_answer !== null).length;
  const correctCount = studentAnswers.filter((a) => a.is_correct).length;
  const incorrectCount = answeredCount - correctCount;
  const skippedCount = totalQuestions - answeredCount;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DFC775]/50">
        <Link href="/student">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/student/history">
          <Button variant="outline" size="sm">
            All Exam Records
          </Button>
        </Link>
      </div>

      {/* Hero Scorecard Banner */}
      <Card goldBorder className="overflow-hidden">
        <div className={`p-8 text-center border-b ${
          isPassed ? "bg-[#E7F2EE]/50 border-[#BBD5CB]" : "bg-[#FBEBEB]/50 border-[#E8B3B3]"
        }`}>
          <div className="inline-flex p-3 rounded-full mb-3 bg-white shadow-sm border border-[#DFC775]">
            {isPassed ? (
              <CheckCircle className="w-10 h-10 text-[#166534]" />
            ) : (
              <XCircle className="w-10 h-10 text-[#8B1E1E]" />
            )}
          </div>

          <Badge variant={isPassed ? "success" : "danger"} className="mb-2">
            {isPassed ? "OFFICIAL STATUS: PASSED" : "OFFICIAL STATUS: DID NOT MEET CRITERIA"}
          </Badge>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3D2E] mt-2">
            {attempt.exam?.title}
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            {attempt.exam?.subject} • Completed on{" "}
            {attempt.submitted_at
              ? new Date(attempt.submitted_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Recently"}
          </p>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="text-center px-6 py-3 bg-[#FCFBF8] border border-[#DFC775] rounded-2xl shadow-sm">
              <span className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider block">
                Total Score
              </span>
              <span className="font-serif text-4xl font-bold text-[#0B3D2E] block mt-0.5">
                {score} <span className="text-lg font-normal text-[#5A5A5A]">/ {totalMarks}</span>
              </span>
            </div>

            <div className="text-center px-6 py-3 bg-[#FCFBF8] border border-[#DFC775] rounded-2xl shadow-sm">
              <span className="text-xs uppercase font-semibold text-[#5A5A5A] tracking-wider block">
                Percentage
              </span>
              <span className={`font-serif text-4xl font-bold block mt-0.5 ${
                isPassed ? "text-[#166534]" : "text-[#8B1E1E]"
              }`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <CardContent className="p-6 bg-[#FAF7F0]">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#0B3D2E] mb-4">
            Response & Accuracy Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FCFBF8] border border-[#E5E1D8] rounded-xl text-center">
              <span className="text-xs text-[#5A5A5A] block">Total Inquiries</span>
              <strong className="text-xl font-bold text-[#0B3D2E] mt-1 block">
                {totalQuestions}
              </strong>
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#BBD5CB] rounded-xl text-center">
              <span className="text-xs text-[#166534] block">Correct Answers</span>
              <strong className="text-xl font-bold text-[#166534] mt-1 block">
                {correctCount}
              </strong>
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E8B3B3] rounded-xl text-center">
              <span className="text-xs text-[#8B1E1E] block">Incorrect Answers</span>
              <strong className="text-xl font-bold text-[#8B1E1E] mt-1 block">
                {incorrectCount}
              </strong>
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#DFC775] rounded-xl text-center">
              <span className="text-xs text-[#A68218] block">Unattempted</span>
              <strong className="text-xl font-bold text-[#A68218] mt-1 block">
                {skippedCount}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question Review */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Detailed Question Review</CardTitle>
            <CardDescription>
              Review your submitted responses alongside official correct solutions and assigned points.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-[#F4EFE2]">
          {questions.map((q, idx) => {
            const studentAns = studentAnswers.find((a) => a.question_id === q.id);
            const isCorrect = studentAns?.is_correct || false;
            const selected = studentAns?.selected_answer;

            return (
              <div key={q.id} className="p-6 space-y-4 hover:bg-[#FAF7F0]/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isCorrect ? "bg-[#166534]" : selected ? "bg-[#8B1E1E]" : "bg-[#8C8C8C]"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCorrect ? "success" : selected ? "danger" : "neutral"}>
                          {isCorrect ? "Correct" : selected ? "Incorrect" : "Unattempted"}
                        </Badge>
                        <span className="text-xs font-bold text-[#C9A227]">
                          {isCorrect ? q.marks : 0} / {q.marks} Points
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#2B2B2B]">
                        {q.question_text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Options display with correct highlighting */}
                <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => {
                    const isOfficialCorrect = opt === q.correct_answer;
                    const isUserChoice = opt === selected;

                    let optStyle = "bg-[#FCFBF8] border-[#E5E1D8] text-[#5A5A5A]";
                    if (isOfficialCorrect) {
                      optStyle = "bg-[#E7F2EE] border-[#166534] text-[#166534] font-semibold";
                    } else if (isUserChoice && !isCorrect) {
                      optStyle = "bg-[#FBEBEB] border-[#8B1E1E] text-[#8B1E1E] font-medium";
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isOfficialCorrect && (
                          <span className="text-[11px] font-bold text-[#166534] flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Correct Key
                          </span>
                        )}

                        {isUserChoice && !isOfficialCorrect && (
                          <span className="text-[11px] font-bold text-[#8B1E1E] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
