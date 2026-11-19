import { z } from "zod";

export const examSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().max(1000).optional().or(z.literal("")),
    subject: z.string().min(2, "Subject is required").max(60),
    duration_minutes: z.coerce
      .number({ invalid_type_error: "Duration must be a number" })
      .min(1, "Duration must be at least 1 minute")
      .max(480, "Duration cannot exceed 8 hours"),
    pass_percentage: z.coerce
      .number({ invalid_type_error: "Pass percentage must be a number" })
      .min(0, "Pass percentage cannot be negative")
      .max(100, "Pass percentage cannot exceed 100%"),
    start_time: z.string().min(1, "Start date and time is required"),
    end_time: z.string().min(1, "End date and time is required"),
    is_published: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export type ExamInput = z.infer<typeof examSchema>;

export const questionSchema = z.object({
  question_text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["mcq", "true_false"]),
  marks: z.coerce
    .number({ invalid_type_error: "Marks must be a number" })
    .min(1, "Marks must be at least 1")
    .max(100, "Marks cannot exceed 100"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  correct_answer: z.string().min(1, "Please select or specify the correct answer"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
