"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Send,
  Flag,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import type { Exam, StudentQuestionView, ExamAttempt } from "@/types/database";
import { toast } from "sonner";

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<StudentQuestionView[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  // Exam navigation & responses state
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of question_id -> selected_answer
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Set of question_ids marked for review
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Timer state in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & submittal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTabSwitches] = useState(0);

  // Initialize and load attempt
  useEffect(() => {
    async function initExam() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error("Your session has expired. Please log in.");
          router.push("/login");
          return;
        }

        const studentId = user.id;

        const [examData, questionsData, attemptData] = await Promise.all([
          examService.getExamById(examId),
          examService.getQuestionsForStudent(examId),
          examService.startAttempt(examId, studentId),
        ]);

        if (!examData || questionsData.length === 0) {
          toast.error("Examination or questions unavailable.");
          router.push("/student");
          return;
        }

        // Check if already submitted
        if (attemptData.status === "submitted") {
          toast.info("This examination has already been completed and submitted.");
          router.push(`/student/attempts/${attemptData.id}/result`);
          return;
        }

        setExam(examData);
        setQuestions(questionsData);
        setAttempt(attemptData);

        // Compute remaining duration based on start time
        const startTime = new Date(attemptData.started_at).getTime();
        const totalDurationMs = examData.duration_minutes * 60 * 1000;
        const elapsedMs = Date.now() - startTime;
        const remainingSeconds = Math.max(0, Math.floor((totalDurationMs - elapsedMs) / 1000));

        setTimeLeft(remainingSeconds);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load exam arena.");
        router.push("/student");
      } finally {
        setLoading(false);
      }
    }
    initExam();
  }, [examId, router]);

  // Tab switch listener for anti-cheat proctoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          toast.warning(`Academic Alert: Tab switch detected (${updated} time${updated > 1 ? "s" : ""}). Stay on this window!`);
          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Submit attempt handler (auto-grader)
  const submitExam = useCallback(async () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const answersPayload = Object.entries(answers).map(([qId, ans]) => ({
        question_id: qId,
        selected_answer: ans,
      }));

      await examService.submitAttempt(attempt.id, answersPayload);

      toast.success("Examination submitted and auto-graded successfully!");
      router.push(`/student/attempts/${attempt.id}/result`);
    } catch (err: any) {
      toast.error(err?.message || "Error submitting exam. Please retry.");
      setIsSubmitting(false);
    }
  }, [attempt, answers, isSubmitting, router]);

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft <= 0 && !loading && attempt && attempt.status !== "submitted") {
      toast.warning("Time limit expired! Automatically finalizing submission...");
      submitExam();
      return;
    }

    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, loading, attempt, submitExam]);

  // Format time mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (option: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const toggleFlagCurrent = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] text-[#0B3D2E]">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 animate-spin mx-auto text-[#0B3D2E]" />
          <p className="font-serif font-bold text-sm">Preparing Examination Session...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const isTimeCritical = timeLeft < 300; // less than 5 mins

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0]">
      {/* Top Proctoring & Timer Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FCFBF8] border-b border-[#DFC775] shadow-luxury px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#0B3D2E] truncate">
              {exam?.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#5A5A5A]">
              <span>Subject: <strong>{exam?.subject}</strong></span>
              <span>•</span>
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Timer Display */}
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm sm:text-base transition-colors ${
                isTimeCritical
                  ? "bg-[#FBEBEB] border-[#8B1E1E] text-[#8B1E1E] animate-pulse"
                  : "bg-[#FAF7F0] border-[#DFC775] text-[#0B3D2E]"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setSubmitModalOpen(true)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      {/* Main Arena Workspace */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Active Question Display (cols 1-3) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          <Card goldBorder className="flex-1 flex flex-col justify-between">
            <CardContent className="pt-6 space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE2]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-sm">
                    {currentIndex + 1}
                  </span>
                  <Badge variant={currentQ?.type === "mcq" ? "neutral" : "gold"}>
                    {currentQ?.type === "mcq" ? "Multiple Choice" : "True / False"}
                  </Badge>
                  <span className="text-xs font-bold text-[#C9A227]">
                    {currentQ?.marks} Points
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleFlagCurrent}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    flagged[currentQ?.id]
                      ? "bg-[#FDF4D4] border-[#C9A227] text-[#A68218]"
                      : "bg-[#FAF7F0] border-[#E5E1D8] text-[#5A5A5A] hover:bg-[#F4EFE2]"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentQ?.id] ? "Marked for Review" : "Mark for Review"}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-[#2B2B2B] leading-relaxed">
                {currentQ?.question_text}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ?.options?.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-[#E7F2EE] border-[#0B3D2E] text-[#0B3D2E] shadow-sm font-semibold"
                          : "bg-[#FCFBF8] border-[#E5E1D8] text-[#2B2B2B] hover:bg-[#FAF7F0] hover:border-[#DFC775]"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#0B3D2E] border-[#0B3D2E] text-white"
                            : "border-[#8C8C8C] bg-white text-[#5A5A5A]"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm flex-1">{option}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>

            {/* Bottom Question Step Navigation */}
            <div className="p-4 bg-[#FAF7F0] border-t border-[#F4EFE2] rounded-b-xl flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous Question
              </Button>

              <div className="text-xs text-[#5A5A5A] font-medium">
                {answeredCount} of {questions.length} Answered
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSubmitModalOpen(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Question Navigator Grid & Stats (col 4) */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#0B3D2E] uppercase tracking-wider">
                Question Navigator
              </h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5A5A5A] pb-3 border-b border-[#F4EFE2]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#0B3D2E]" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#FAF7F0] border border-[#E5E1D8]" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#C9A227]" />
                  <span>Flagged ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded ring-2 ring-[#0B3D2E]" />
                  <span>Current</span>
                </div>
              </div>

              {/* Navigator Bubble Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlagged = !!flagged[q.id];

                  let style = "bg-[#FAF7F0] border border-[#E5E1D8] text-[#5A5A5A]";
                  if (isFlagged) {
                    style = "bg-[#C9A227] text-white border-[#A68218]";
                  } else if (isAnswered) {
                    style = "bg-[#0B3D2E] text-white border-[#0B3D2E]";
                  }

                  if (isCurrent) {
                    style += " ring-2 ring-offset-1 ring-[#0B3D2E] font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button in Sidebar */}
              <div className="pt-4 border-t border-[#F4EFE2]">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Finalize & Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Proctoring Reminder */}
          <div className="p-3.5 bg-[#FCFBF8] border border-[#DFC775]/60 rounded-xl space-y-1 text-xs text-[#5A5A5A]">
            <div className="flex items-center gap-1.5 font-bold text-[#0B3D2E]">
              <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
              <span>Session Proctor Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Maintain full screen view. All answers are recorded in persistent session cache.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Ready to Finalize Your Examination?"
        description="Verify your progress breakdown before concluding."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitModalOpen(false)}
            >
              Continue Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={submitExam}
            >
              Confirm Final Submission
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF7F0] border border-[#DFC775]/50 rounded-xl text-center">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#5A5A5A] block">
                Answered
              </span>
              <strong className="text-base text-[#166534]">{answeredCount}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#5A5A5A] block">
                Unanswered
              </span>
              <strong className="text-base text-[#8B1E1E]">{unansweredCount}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#5A5A5A] block">
                Flagged
              </span>
              <strong className="text-base text-[#C9A227]">{flaggedCount}</strong>
            </div>
          </div>

          {unansweredCount > 0 && (
            <p className="text-xs text-[#8B1E1E] bg-[#FBEBEB] p-3 rounded-lg border border-[#E8B3B3]">
              Warning: You have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}</strong>. Once submitted, you cannot revise or fill them in.
            </p>
          )}

          <p className="text-xs text-[#5A5A5A] leading-relaxed">
            Upon clicking &ldquo;Confirm Final Submission&rdquo;, your answers will be automatically graded and your scorecard will generate immediately.
          </p>
        </div>
      </Modal>
    </div>
  );
}
