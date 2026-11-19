"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link.");
        return;
      }

      setIsSubmitted(true);
      toast.success("Password reset link has been dispatched to your email.");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F0]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B3D2E] border-2 border-[#C9A227] flex items-center justify-center text-[#DFC775] shadow-luxury transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight text-[#0B3D2E]">
            Aura<span className="text-[#C9A227]">Exam</span>
          </span>
        </Link>
        <h2 className="font-serif text-2xl font-bold text-[#0B3D2E] tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1 text-sm text-[#5A5A5A]">
          We will send you a secure link to reset your account password
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card goldBorder className="p-2 sm:p-4">
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E7F2EE] border-2 border-[#166534] mx-auto flex items-center justify-center text-[#166534]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Check Your Inbox
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  If an account exists with that email address, you will receive password reset instructions shortly.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="name@institution.edu"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-2"
                >
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-[#F4EFE2] text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D2E] hover:text-[#C9A227] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
