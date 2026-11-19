"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  GraduationCap,
  LogOut,
  User,
  Menu,
  X,
  BookOpen,
  PlusCircle,
  BarChart3,
  Users,
  ShieldCheck,
  History,
  FileCheck,
} from "lucide-react";
import type { Profile } from "@/types/database";

interface NavbarProps {
  profile?: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Successfully signed out. Have a great day!");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const role = profile?.role || "student";

  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { href: "/admin", label: "Overview", icon: ShieldCheck },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/admin/exams", label: "All Exams", icon: BookOpen },
      ];
    }
    if (role === "teacher") {
      return [
        { href: "/teacher", label: "My Exams", icon: BookOpen },
        { href: "/teacher/exams/create", label: "Create Exam", icon: PlusCircle },
        { href: "/teacher/analytics", label: "Results & Analytics", icon: BarChart3 },
      ];
    }
    // student
    return [
      { href: "/student", label: "Available Exams", icon: BookOpen },
      { href: "/student/history", label: "Exam History", icon: History },
      { href: "/student/results", label: "My Results", icon: FileCheck },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#DFC775]/50 shadow-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo / Brand */}
          <Link
            href={profile ? `/${role}` : "/"}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] border border-[#C9A227] flex items-center justify-center text-[#DFC775] shadow-luxury transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#0B3D2E] block leading-none">
                Aura<span className="text-[#C9A227]">Exam</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#5A5A5A] block mt-0.5">
                Examination Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {profile && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0B3D2E] text-white shadow-sm"
                        : "text-[#2B2B2B] hover:text-[#0B3D2E] hover:bg-[#F4EFE2]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-[#0B3D2E] leading-tight">
                    {profile.full_name}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <Badge variant={role as any}>{role}</Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  isLoading={isLoggingOut}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  Sign Out
                </Button>

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-[#0B3D2E] hover:bg-[#F4EFE2] focus:outline-none"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="gold" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {profile && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#F4EFE2] space-y-2">
            <div className="px-3 py-2 bg-[#F4EFE2] rounded-lg mb-3">
              <p className="text-sm font-bold text-[#0B3D2E]">{profile.full_name}</p>
              <p className="text-xs text-[#5A5A5A]">{profile.email}</p>
              <div className="mt-1">
                <Badge variant={role as any}>{role}</Badge>
              </div>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0B3D2E] text-white"
                      : "text-[#2B2B2B] hover:bg-[#F4EFE2] hover:text-[#0B3D2E]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-[#F4EFE2]">
              <Button
                variant="maroon"
                size="sm"
                onClick={handleSignOut}
                isLoading={isLoggingOut}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
