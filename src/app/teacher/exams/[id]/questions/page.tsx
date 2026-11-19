"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit,
  Award,
  CheckCircle2,
  HelpCircle,
  Check,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { examService } from "@/lib/data/examService";
import type { Exam, Question, QuestionType } from "@/types/database";
import { toast } from "sonner";

export default function QuestionBankPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Question Modal state (create or edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [marks, setMarks] = useState<number>(10);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  // Delete modal state
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const examData = await examService.getExamById(examId);
      const questionsData = await examService.getQuestions(examId);
      setExam(examData);
      setQuestions(questionsData);
    } catch {
      toast.error("Failed to load question bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [examId]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionType("mcq");
    setMarks(10);
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question_text);
    setQuestionType(q.type);
    setMarks(q.marks);
    setOptions(q.type === "true_false" ? ["True", "False"] : [...q.options]);
    setCorrectAnswer(q.correct_answer);
    setModalOpen(true);
  };

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    if (type === "true_false") {
      setOptions(["True", "False"]);
      setCorrectAnswer("True");
    } else {
      setOptions(["Option A", "Option B", "Option C", "Option D"]);
      setCorrectAnswer("Option A");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    const oldValue = updated[index];
    updated[index] = value;
    setOptions(updated);
    if (correctAnswer === oldValue) {
      setCorrectAnswer(value);
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const removed = options[index];
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
      if (correctAnswer === removed) {
        setCorrectAnswer(updated[0] || "");
      }
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (marks <= 0) {
      toast.error("Question marks must be at least 1.");
      return;
    }
    if (!correctAnswer) {
      toast.error("Please mark the correct answer.");
      return;
    }
    if (questionType === "mcq" && options.some((opt) => !opt.trim())) {
      toast.error("All options must have text.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingQuestion) {
        await examService.updateQuestion(editingQuestion.id, {
          question_text: questionText,
          type: questionType,
          marks: Number(marks),
          options: questionType === "true_false" ? ["True", "False"] : options,
          correct_answer: correctAnswer,
        });
        toast.success("Question updated successfully.");
      } else {
        await examService.createQuestion({
          exam_id: examId,
          question_text: questionText,
          type: questionType,
          marks: Number(marks),
          options: questionType === "true_false" ? ["True", "False"] : options,
          correct_answer: correctAnswer,
        });
        toast.success("Question added to exam bank.");
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to save question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await examService.deleteQuestion(questionToDelete.id, examId);
      toast.success("Question deleted successfully.");
      setQuestionToDelete(null);
      loadData();
    } catch {
      toast.error("Failed to delete question.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFC775]/50">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Exams
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
                Question Bank
              </h1>
              <Badge variant={exam?.is_published ? "success" : "warning"}>
                {exam?.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-xs text-[#5A5A5A] mt-0.5">
              Exam: <strong className="text-[#0B3D2E]">{exam?.title}</strong> ({exam?.subject})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#FCFBF8] border border-[#DFC775] rounded-xl flex items-center gap-2 text-xs">
            <Award className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[#5A5A5A]">Calculated Total:</span>
            <strong className="text-[#0B3D2E] text-sm">{totalMarks} Points</strong>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={openCreateModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* Question List */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Composed Questions ({questions.length})</CardTitle>
            <CardDescription>
              Questions are delivered in order to students during their examination session.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-[#5A5A5A]">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <HelpCircle className="w-12 h-12 text-[#8C8C8C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">
                Question Bank is Empty
              </h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Add Multiple Choice or True/False questions with marks to equip this exam.
              </p>
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE2]">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 hover:bg-[#FAF7F0]/60 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#0B3D2E] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={q.type === "mcq" ? "neutral" : "gold"}>
                            {q.type === "mcq" ? "Multiple Choice" : "True / False"}
                          </Badge>
                          <span className="text-xs font-bold text-[#C9A227]">
                            {q.marks} Mark{q.marks > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#2B2B2B] leading-relaxed">
                          {q.question_text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(q)}
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => setQuestionToDelete(q)}
                        className="p-2 text-[#8B1E1E] hover:bg-[#FBEBEB] rounded-lg transition-colors focus:outline-none"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options Display */}
                  <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.correct_answer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            isCorrect
                              ? "bg-[#E7F2EE] border-[#BBD5CB] text-[#166534] font-medium"
                              : "bg-[#FCFBF8] border-[#E5E1D8] text-[#5A5A5A]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? "Edit Examination Question" : "Add Question to Exam"}
        description="Select format, write the inquiry, specify choices, and designate the accurate answer."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E] mb-1">
                Question Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("mcq")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    questionType === "mcq"
                      ? "bg-[#0B3D2E] text-white border-[#C9A227]"
                      : "bg-[#FAF7F0] text-[#5A5A5A] border-[#DFC775]/50"
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("true_false")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    questionType === "true_false"
                      ? "bg-[#0B3D2E] text-white border-[#C9A227]"
                      : "bg-[#FAF7F0] text-[#5A5A5A] border-[#DFC775]/50"
                  }`}
                >
                  True / False
                </button>
              </div>
            </div>

            <div>
              <Input
                label="Marks / Points"
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                min={1}
                max={100}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E] mb-1">
              Question Text / Problem Statement
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="State the question clearly..."
              required
              className="w-full rounded-lg bg-[#FCFBF8] border border-[#DFC775]/60 hover:border-[#C9A227] text-[#2B2B2B] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            />
          </div>

          {/* Options & Correct Answer Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]">
                Choices (Click radio to mark as correct answer)
              </label>
              {questionType === "mcq" && options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-semibold text-[#0B3D2E] hover:text-[#C9A227] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Choice
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => {
                const isSelected = correctAnswer === opt && opt !== "";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-[#E7F2EE] border-[#BBD5CB]"
                        : "bg-[#FAF7F0] border-[#E5E1D8]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(opt)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#166534] border-[#166534] text-white"
                          : "border-[#8C8C8C] bg-white text-transparent"
                      }`}
                      title="Set as correct answer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {questionType === "true_false" ? (
                      <span className="text-sm font-semibold text-[#2B2B2B] px-2">
                        {opt}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        required
                        className="flex-1 bg-transparent text-sm text-[#2B2B2B] focus:outline-none"
                      />
                    )}

                    {questionType === "mcq" && options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="p-1 text-[#8C8C8C] hover:text-[#8B1E1E]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {!correctAnswer && (
              <p className="text-xs text-[#8B1E1E] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please mark one option as the correct answer.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE2]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              {editingQuestion ? "Save Question" : "Add to Exam"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Question Modal */}
      <Modal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Confirm Question Removal"
        description="This will permanently delete this question and update the exam total points."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuestionToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="maroon"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete Question
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#2B2B2B]">
          Are you sure you want to delete this question?
          <br />
          <strong className="block mt-2 italic text-[#5A5A5A]">
            &ldquo;{questionToDelete?.question_text}&rdquo;
          </strong>
        </p>
      </Modal>
    </div>
  );
}
