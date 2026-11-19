"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("invalid login credentials")) {
          toast.error("Invalid email or password. Please verify your credentials.");
        } else if (authError.message.toLowerCase().includes("email not confirmed")) {
          toast.error("Please confirm your email address before logging in.");
        } else {
          toast.error(authError.message || "Failed to log in.");
        }
        return;
      }

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", authData.user.id)
          .single();

        if (profileError || !profile) {
          const metaRole = authData.user.user_metadata?.role || "student";
          toast.success("Welcome back!");
          router.push(redirectPath || `/${metaRole}`);
          router.refresh();
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          toast.error("Your account has been deactivated. Please contact the administrator.");
          return;
        }

        toast.success(`Welcome back! Logged in as ${profile.role}.`);

        if (redirectPath) {
          router.push(redirectPath);
        } else if (profile.role === "admin") {
          router.push("/admin");
        } else if (profile.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setValue("email", email);
    setValue("password", "ExamPass123!");
  };

  return (
    <div className="w-full max-w-md">
      {errorParam && (
        <div className="mb-4 p-4 rounded-xl bg-[#FBEBEB] border border-[#E8B3B3] flex items-center gap-3 text-[#8B1E1E]">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-xs font-medium">{errorParam}</span>
        </div>
      )}

      <Card goldBorder className="p-2 sm:p-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@institution.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#C9A227] hover:text-[#0B3D2E] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                showPasswordToggle
                leftIcon={<Lock className="w-4 h-4" />}
                {...register("password")}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 p-3.5 bg-[#FAF7F0] border border-[#DFC775]/50 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B3D2E]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Demo Accounts Quick Fill:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@examportal.edu")}
                className="px-2 py-1.5 text-[11px] font-medium bg-[#FCFBF8] border border-[#DFC775]/60 rounded-md hover:bg-[#F4EFE2] text-[#0B3D2E]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("teacher@examportal.edu")}
                className="px-2 py-1.5 text-[11px] font-medium bg-[#FCFBF8] border border-[#DFC775]/60 rounded-md hover:bg-[#F4EFE2] text-[#0B3D2E]"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("student@examportal.edu")}
                className="px-2 py-1.5 text-[11px] font-medium bg-[#FCFBF8] border border-[#DFC775]/60 rounded-md hover:bg-[#F4EFE2] text-[#0B3D2E]"
              >
                Student
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#F4EFE2] text-center">
            <p className="text-xs text-[#5A5A5A]">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#0B3D2E] hover:text-[#C9A227] underline decoration-[#DFC775] transition-colors"
              >
                Register Now
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
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
          Academic Portal Sign In
        </h2>
        <p className="mt-1 text-sm text-[#5A5A5A]">
          Enter your credentials to access your examinations and records
        </p>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-[#0B3D2E]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading portal credentials...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
