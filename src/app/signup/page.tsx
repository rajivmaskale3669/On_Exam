"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, User, UserCheck, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("unique constraint") ||
          authError.status === 422
        ) {
          toast.error("This email address is already registered. Please log in instead.");
        } else {
          toast.error(authError.message || "Failed to create account. Please try again.");
        }
        return;
      }

      // Check if user session was automatically established (email confirmation turned off)
      if (authData.session) {
        toast.success("Account successfully created! Welcome to AuraExam.");
        router.push(data.role === "teacher" ? "/teacher" : "/student");
        router.refresh();
      } else {
        // Confirmation email required
        setSignupSuccessMessage(
          `A verification link has been sent to ${data.email}. Please verify your email to log in.`
        );
        toast.success("Registration successful! Please check your email.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F0]">
      {/* Decorative Brand Header */}
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
          Create an Academic Account
        </h2>
        <p className="mt-1 text-sm text-[#5A5A5A]">
          Join the premier online assessment and examination platform
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card goldBorder className="p-2 sm:p-4">
          <CardContent className="pt-6">
            {signupSuccessMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E7F2EE] border-2 border-[#166534] mx-auto flex items-center justify-center text-[#166534]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Verify Your Email
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  {signupSuccessMessage}
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Proceed to Log In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E] mb-2">
                    I am registering as a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("role", "student")}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        selectedRole === "student"
                          ? "bg-[#0B3D2E] text-white border-[#C9A227] shadow-luxury"
                          : "bg-[#FCFBF8] text-[#5A5A5A] border-[#DFC775]/50 hover:bg-[#F4EFE2]"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "teacher")}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        selectedRole === "teacher"
                          ? "bg-[#0B3D2E] text-white border-[#C9A227] shadow-luxury"
                          : "bg-[#FCFBF8] text-[#5A5A5A] border-[#DFC775]/50 hover:bg-[#F4EFE2]"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      Teacher / Examiner
                    </button>
                  </div>
                  {errors.role && (
                    <p className="text-xs text-[#8B1E1E] mt-1">{errors.role.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <Input
                  label="Full Name"
                  placeholder="e.g. Julian Montgomery"
                  leftIcon={<User className="w-4 h-4" />}
                  {...register("full_name")}
                  error={errors.full_name?.message}
                />

                {/* Email Address */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@institution.edu"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...register("email")}
                  error={errors.email?.message}
                />

                {/* Password */}
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  showPasswordToggle
                  helperText="Must contain at least 8 chars, 1 uppercase letter, and 1 number."
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register("password")}
                  error={errors.password?.message}
                />

                {/* Confirm Password */}
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  showPasswordToggle
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register("confirm_password")}
                  error={errors.confirm_password?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-2"
                >
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-[#F4EFE2] text-center">
              <p className="text-xs text-[#5A5A5A]">
                Already have an academic account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0B3D2E] hover:text-[#C9A227] underline decoration-[#DFC775] transition-colors"
                >
                  Log In Here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
