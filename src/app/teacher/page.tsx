"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Clock, Award, Users, CheckCircle, XCircle, MoreVertical, Edit, HelpCircle, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { examService } from "@/lib/data/examService";
import type { Exam } from "@/types/database";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examService.getExams("teacher", "22222222-2222-2222-2222-222222222222");
      setExams(data);
    } catch {
      toast.error("Failed to load examinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleTogglePublish = async (exam: Exam) => {
    try {
      const success = await examService.togglePublishExam(exam.id, exam.is_published);
      if (success) {
        toast.success(
          `Exam "${exam.title}" has been ${exam.is_published ? "unpublished (draft)" : "published to students"}.`
        );
        fetchExams();
      } else {
        toast.error("Failed to toggle publish status.");
      }
    } catch {
      toast.error("Error updating exam status.");
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      const success = await examService.deleteExam(examToDelete.id);
      if (success) {
        toast.success(`Exam "${examToDelete.title}" removed successfully.`);
        setExamToDelete(null);
        fetchExams();
      } else {
        toast.error("Failed to delete exam.");
      }
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalExams = exams.length;
  const publishedCount = exams.filter((e) => e.is_published).length;
  const draftCount = totalExams - publishedCount;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DFC775]/50">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#0B3D2E] tracking-tight">
            Examiner Studio
          </h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Design, schedule, and oversee academic assessments and evaluate student submissions.
          </p>
        </div>
        <Link href="/teacher/exams/create">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Exam
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#5A5A5A]">
                Total Examinations
              </p>
              <p className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
                {totalExams}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#0B3D2E] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#5A5A5A]">
                Published & Active
              </p>
              <p className="font-serif text-3xl font-bold text-[#166534] mt-1">
                {publishedCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E7F2EE] text-[#166534] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card goldBorder>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#5A5A5A]">
                Drafts in Preparation
              </p>
              <p className="font-serif text-3xl font-bold text-[#A68218] mt-1">
                {draftCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FDF4D4] text-[#A68218] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Authored Examinations</CardTitle>
            <CardDescription>
              Manage questions, configure scoring rules, or publish tests for student participation.
            </CardDescription>
          </div>
          <Link href="/teacher/exams/create">
            <Button variant="gold" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Add Exam
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-[#5A5A5A]">
              Loading examinations...
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <BookOpen className="w-12 h-12 text-[#8C8C8C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
                No Exams Authored Yet
              </h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Begin by creating your first course assessment. You can add questions, set pass marks, and schedule exam dates.
              </p>
              <Link href="/teacher/exams/create">
                <Button variant="primary" size="sm">
                  Create First Exam
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE2]">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F0]/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg font-bold text-[#0B3D2E]">
                        {exam.title}
                      </span>
                      <Badge variant={exam.is_published ? "success" : "warning"} dot>
                        {exam.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="neutral">{exam.subject}</Badge>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-[#5A5A5A] line-clamp-2 max-w-2xl">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A5A5A] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0B3D2E]" />
                        {exam.duration_minutes} Minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                        Total Marks: <strong>{exam.total_marks}</strong> (Pass: {exam.pass_percentage}%)
                      </span>
                      <span>
                        Window: {new Date(exam.start_time).toLocaleDateString()} – {new Date(exam.end_time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/teacher/exams/${exam.id}/questions`}>
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                      >
                        Questions
                      </Button>
                    </Link>

                    <Link href={`/teacher/exams/${exam.id}/submissions`}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                      >
                        Submissions
                      </Button>
                    </Link>

                    <Button
                      variant={exam.is_published ? "ghost" : "primary"}
                      size="sm"
                      onClick={() => handleTogglePublish(exam)}
                    >
                      {exam.is_published ? "Unpublish" : "Publish"}
                    </Button>

                    <Link href={`/teacher/exams/${exam.id}/edit`}>
                      <Button variant="ghost" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                    </Link>

                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 text-[#8B1E1E] hover:bg-[#FBEBEB] rounded-lg transition-colors focus:outline-none"
                      title="Delete Exam"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        title="Confirm Exam Deletion"
        description="This action cannot be undone."
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
              onClick={handleDeleteExam}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#2B2B2B]">
          Are you sure you want to permanently delete the exam{" "}
          <strong>&ldquo;{examToDelete?.title}&rdquo;</strong>? All associated question sets and student submission records will be permanently erased.
        </p>
      </Modal>
    </div>
  );
}
