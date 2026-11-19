"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, type ExamInput } from "@/lib/validations/exam";
import { examService } from "@/lib/data/examService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Clock, Award, Calendar, CheckSquare, Loader2 } from "lucide-react";
import type { Exam } from "@/types/database";

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExamInput>({
    resolver: zodResolver(examSchema),
  });

  const isPublished = watch("is_published");

  useEffect(() => {
    async function loadExam() {
      setIsFetching(true);
      try {
        const data = await examService.getExamById(examId);
        if (data) {
          setExam(data);
          reset({
            title: data.title,
            description: data.description || "",
            subject: data.subject,
            duration_minutes: data.duration_minutes,
            pass_percentage: data.pass_percentage,
            start_time: new Date(data.start_time).toISOString().slice(0, 16),
            end_time: new Date(data.end_time).toISOString().slice(0, 16),
            is_published: data.is_published,
          });
        } else {
          toast.error("Exam not found.");
          router.push("/teacher");
        }
      } catch {
        toast.error("Failed to fetch exam data.");
      } finally {
        setIsFetching(false);
      }
    }
    loadExam();
  }, [examId, reset, router]);

  const onSubmit = async (data: ExamInput) => {
    setIsLoading(true);
    try {
      await examService.updateExam(examId, {
        title: data.title,
        description: data.description || null,
        subject: data.subject,
        duration_minutes: Number(data.duration_minutes),
        pass_percentage: Number(data.pass_percentage),
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        is_published: !!data.is_published,
      });

      toast.success("Exam parameters updated successfully!");
      router.push("/teacher");
    } catch {
      toast.error("Failed to update exam.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="text-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B3D2E] mx-auto mb-2" />
        <p className="text-sm text-[#5A5A5A]">Loading examination details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Exams
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
              Edit Examination
            </h1>
            <p className="text-xs text-[#5A5A5A]">
              Update title, duration, schedule, or publishing status.
            </p>
          </div>
        </div>

        <Link href={`/teacher/exams/${examId}/questions`}>
          <Button variant="gold" size="sm">
            Manage Questions ({exam?.total_marks || 0} pts)
          </Button>
        </Link>
      </div>

      <Card goldBorder>
        <CardHeader>
          <CardTitle>Exam Parameters: {exam?.title}</CardTitle>
          <CardDescription>
            Changes take effect immediately for upcoming student candidates.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Exam Title"
                  placeholder="e.g. Advanced Thermodynamics Midterm Assessment"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                  {...register("title")}
                  error={errors.title?.message}
                />
              </div>

              <Input
                label="Course / Subject"
                placeholder="e.g. Mechanical Engineering"
                {...register("subject")}
                error={errors.subject?.message}
              />

              <Input
                label="Duration (in Minutes)"
                type="number"
                placeholder="60"
                leftIcon={<Clock className="w-4 h-4" />}
                {...register("duration_minutes")}
                error={errors.duration_minutes?.message}
              />

              <Input
                label="Passing Threshold (%)"
                type="number"
                placeholder="50"
                leftIcon={<Award className="w-4 h-4" />}
                {...register("pass_percentage")}
                error={errors.pass_percentage?.message}
              />

              <div className="flex flex-col justify-end space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]">
                  Publish Status
                </label>
                <div
                  onClick={() => setValue("is_published", !isPublished)}
                  className={`cursor-pointer p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isPublished
                      ? "bg-[#E7F2EE] border-[#BBD5CB] text-[#166534]"
                      : "bg-[#FCFBF8] border-[#DFC775]/50 text-[#5A5A5A]"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {isPublished ? "Published (Accessible to Students)" : "Draft (Hidden from Students)"}
                  </span>
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              <Input
                label="Exam Availability Start Date & Time"
                type="datetime-local"
                leftIcon={<Calendar className="w-4 h-4" />}
                {...register("start_time")}
                error={errors.start_time?.message}
              />

              <Input
                label="Exam Availability End Date & Time"
                type="datetime-local"
                leftIcon={<Calendar className="w-4 h-4" />}
                {...register("end_time")}
                error={errors.end_time?.message}
              />

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]">
                  Examination Description & Candidate Instructions
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg bg-[#FCFBF8] border border-[#DFC775]/60 hover:border-[#C9A227] text-[#2B2B2B] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-[#8B1E1E]">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE2]">
              <Link href="/teacher">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
