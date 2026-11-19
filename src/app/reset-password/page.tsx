"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { GraduationCap, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Failed to update password.");
        return;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully!");
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
          Create New Password
        </h2>
        <p className="mt-1 text-sm text-[#5A5A5A]">
          Set a secure new password for your account
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card goldBorder className="p-2 sm:p-4">
          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E7F2EE] border-2 border-[#166534] mx-auto flex items-center justify-center text-[#166534]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Password Successfully Changed
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  You can now log in using your newly configured credentials.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  showPasswordToggle
                  helperText="Must contain at least 8 chars, 1 uppercase letter, and 1 number."
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register("password")}
                  error={errors.password?.message}
                />

                <Input
                  label="Confirm New Password"
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
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
