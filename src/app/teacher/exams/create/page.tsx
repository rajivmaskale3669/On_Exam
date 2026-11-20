"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, type ExamInput } from "@/lib/validations/exam";
import { examService } from "@/lib/data/examService";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Clock, Award, Calendar, CheckSquare } from "lucide-react";

export default function CreateExamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set default start/end dates
  const defaultStart = new Date().toISOString().slice(0, 16);
  const defaultEnd = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamInput>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      duration_minutes: 60,
      pass_percentage: 50,
      start_time: defaultStart,
      end_time: defaultEnd,
      is_published: false,
    },
  });

  const isPublished = watch("is_published");

  const onSubmit = async (data: ExamInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      const newExam = await examService.createExam({
        teacher_id: user.id,
        title: data.title,
        description: data.description || null,
        subject: data.subject,
        duration_minutes: Number(data.duration_minutes),
        total_marks: 0,
        pass_percentage: Number(data.pass_percentage),
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        is_published: !!data.is_published,
      });

      toast.success(`Exam "${newExam.title}" created successfully! Now let's add questions.`);
      router.push(`/teacher/exams/${newExam.id}/questions`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create exam. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Exams
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
            Create New Examination
          </h1>
          <p className="text-xs text-[#5A5A5A]">
            Define the assessment scope, timing constraints, and academic parameters.
          </p>
        </div>
      </div>

      <Card goldBorder>
        <CardHeader>
          <CardTitle>Exam Configuration</CardTitle>
          <CardDescription>
            All fields are strictly validated. You will be directed to the Question Bank editor immediately after saving.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <Input
                  label="Exam Title"
                  placeholder="e.g. Advanced Thermodynamics Midterm Assessment"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                  {...register("title")}
                  error={errors.title?.message}
                />
              </div>

              {/* Subject */}
              <Input
                label="Course / Subject"
                placeholder="e.g. Mechanical Engineering"
                {...register("subject")}
                error={errors.subject?.message}
              />

              {/* Duration in Minutes */}
              <Input
                label="Duration (in Minutes)"
                type="number"
                placeholder="60"
                leftIcon={<Clock className="w-4 h-4" />}
                {...register("duration_minutes")}
                error={errors.duration_minutes?.message}
              />

              {/* Pass Percentage */}
              <Input
                label="Passing Threshold (%)"
                type="number"
                placeholder="50"
                leftIcon={<Award className="w-4 h-4" />}
                {...register("pass_percentage")}
                error={errors.pass_percentage?.message}
              />

              {/* Publish Toggle Button */}
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
                    {isPublished ? "Directly Publish (Live for Students)" : "Keep as Draft"}
                  </span>
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Start Window */}
              <Input
                label="Exam Availability Start Date & Time"
                type="datetime-local"
                leftIcon={<Calendar className="w-4 h-4" />}
                {...register("start_time")}
                error={errors.start_time?.message}
              />

              {/* End Window */}
              <Input
                label="Exam Availability End Date & Time"
                type="datetime-local"
                leftIcon={<Calendar className="w-4 h-4" />}
                {...register("end_time")}
                error={errors.end_time?.message}
              />

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]">
                  Examination Description & Candidate Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide syllabus topics, calculator permissions, and key candidate guidance..."
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
                Save & Proceed to Questions
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
