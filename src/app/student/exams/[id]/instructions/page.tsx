"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Award, ShieldCheck, AlertTriangle, CheckCircle, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { examService } from "@/lib/data/examService";
import type { Exam } from "@/types/database";
import { toast } from "sonner";

export default function ExamInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await examService.getExamById(examId);
        if (data) {
          setExam(data);
        } else {
          toast.error("Exam not found.");
          router.push("/student");
        }
      } catch {
        toast.error("Failed to load exam instructions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, router]);

  const handleStartExam = async () => {
    if (!agreed) {
      toast.error("You must agree to the academic honor code before commencing.");
      return;
    }
    setIsStarting(true);
    try {
      const studentId = "33333333-3333-3333-3333-333333333333";
      await examService.startAttempt(examId, studentId);
      toast.success("Examination session initiated. Good luck!");
      router.push(`/student/exams/${examId}/attempt`);
    } catch {
      toast.error("Failed to start exam session.");
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-[#5A5A5A]">
        Loading examination instructions...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/student">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Available Exams
        </Button>
      </Link>

      <Card goldBorder>
        <CardHeader>
          <div className="space-y-1">
            <Badge variant="gold">Official Academic Examination</Badge>
            <CardTitle className="text-2xl mt-1">{exam?.title}</CardTitle>
            <CardDescription>{exam?.subject}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Key Constraints Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF7F0] border border-[#DFC775]/50 rounded-xl text-center">
            <div className="p-2">
              <Clock className="w-5 h-5 text-[#0B3D2E] mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-[#5A5A5A] uppercase block">
                Duration Limit
              </span>
              <strong className="text-sm text-[#0B3D2E]">{exam?.duration_minutes} Minutes</strong>
            </div>

            <div className="p-2 border-t sm:border-t-0 sm:border-l border-[#DFC775]/30">
              <Award className="w-5 h-5 text-[#C9A227] mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-[#5A5A5A] uppercase block">
                Total Marks
              </span>
              <strong className="text-sm text-[#0B3D2E]">{exam?.total_marks} Points</strong>
            </div>

            <div className="p-2 border-t sm:border-t-0 sm:border-l border-[#DFC775]/30">
              <CheckCircle className="w-5 h-5 text-[#166534] mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-[#5A5A5A] uppercase block">
                Passing Bar
              </span>
              <strong className="text-sm text-[#166534]">{exam?.pass_percentage}%</strong>
            </div>
          </div>

          {/* Description */}
          {exam?.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E]">
                Examination Overview & Syllabus Scope
              </h4>
              <p className="text-sm text-[#5A5A5A] leading-relaxed bg-[#FCFBF8] p-4 rounded-xl border border-[#E5E1D8]">
                {exam.description}
              </p>
            </div>
          )}

          {/* Rules & Anti-Cheat Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B3D2E]" />
              Mandatory Examination Regulations
            </h4>
            <ul className="space-y-2 text-xs text-[#5A5A5A] list-disc pl-5 leading-relaxed">
              <li>
                <strong>Strict Countdown Timer:</strong> Once you begin, the timer starts running and cannot be paused. When time runs out, your responses will automatically be submitted.
              </li>
              <li>
                <strong>Single Attempt Integrity:</strong> You can only take this examination once. Once submitted, your answers cannot be altered or retaken.
              </li>
              <li>
                <strong>Tab & Focus Tracking:</strong> Switching browser tabs, minimizing the window, or navigating away will be flagged for academic review.
              </li>
              <li>
                <strong>Automatic Verification:</strong> Ensure you review all marked questions before pressing the final submit button.
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <div
            onClick={() => setAgreed(!agreed)}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 ${
              agreed
                ? "bg-[#E7F2EE] border-[#BBD5CB] text-[#166534]"
                : "bg-[#FCFBF8] border-[#DFC775]/60 text-[#2B2B2B]"
            }`}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-[#0B3D2E] focus:ring-[#0B3D2E]"
            />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block">
                Academic Honor Pledge
              </span>
              I affirm that I will complete this examination independently, without unauthorized aid, outside assistance, or artificial assistance.
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-4 border-t border-[#F4EFE2] flex items-center justify-between">
            <Link href="/student">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </Link>

            <Button
              variant="gold"
              size="lg"
              onClick={handleStartExam}
              disabled={!agreed}
              isLoading={isStarting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Timed Examination
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
