"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Award, HelpCircle, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { examService } from "@/lib/data/examService";
import type { Exam } from "@/types/database";
import { toast } from "sonner";

export default function AdminAllExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examService.getExams("admin");
      setExams(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load global examination records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      await examService.deleteExam(examToDelete.id);
      toast.success("Exam purged by administrator.");
      setExamToDelete(null);
      fetchExams();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete exam.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFC775]/50">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
              Institutional Examination Roster
            </h1>
            <p className="text-xs text-[#5A5A5A] mt-0.5">
              Comprehensive list of every course exam authored by faculty.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#5A5A5A]">
          Total Catalog: <strong className="text-[#0B3D2E]">{exams.length} Exams</strong>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <BookOpen className="w-10 h-10 text-[#8C8C8C] mx-auto" />
              <p className="text-sm font-semibold text-[#0B3D2E]">
                No examinations registered yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE2]">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F0]/60 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#0B3D2E]">
                        {exam.title}
                      </span>
                      <Badge variant={exam.is_published ? "success" : "warning"} dot>
                        {exam.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="neutral">{exam.subject}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A5A5A] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0B3D2E]" />
                        {exam.duration_minutes} Mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                        {exam.total_marks} Points (Pass: {exam.pass_percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/teacher/exams/${exam.id}/questions`}>
                      <Button variant="outline" size="sm" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
                        Questions
                      </Button>
                    </Link>

                    <Link href={`/teacher/exams/${exam.id}/submissions`}>
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Submissions
                      </Button>
                    </Link>

                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 text-[#8B1E1E] hover:bg-[#FBEBEB] rounded-lg transition-colors focus:outline-none"
                      title="Purge exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        title="Administrative Exam Purge"
        description="Permanently delete this exam from the institution's database."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExamToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="maroon"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Confirm Purge
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#2B2B2B]">
          Are you sure you want to administratively purge{" "}
          <strong>&ldquo;{examToDelete?.title}&rdquo;</strong>? This will erase all questions, historical candidate answer records, and transcripts.
        </p>
      </Modal>
    </div>
  );
}
