import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  CheckCircle,
  Timer,
  BarChart,
  Sparkles,
  ArrowRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#DFC775]/40">
          <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF4D4] border border-[#C9A227] text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Production-Grade Assessment Platform
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#0B3D2E] max-w-4xl mx-auto leading-tight">
              Institutional Excellence in <br className="hidden sm:inline" />
              <span className="text-[#C9A227] italic">Digital Examination</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed">
              Engineered for uncompromising academic integrity, high-concurrency evaluation, and effortless management for educators and students alike.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Register as Student or Faculty
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Access Portal
                </Button>
              </Link>
            </div>

            {/* Quick Demo Credentials highlight */}
            <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-[#FCFBF8] border border-[#DFC775] shadow-luxury text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE2]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#C9A227]" />
                  Evaluator Demo Credentials
                </span>
                <span className="text-[11px] font-medium text-[#166534] bg-[#E7F2EE] px-2 py-0.5 rounded-full">
                  Password: ExamPass123!
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div className="p-2 bg-[#FAF7F0] rounded-lg">
                  <span className="font-semibold text-[#0B3D2E] block">Admin:</span>
                  <span className="text-[#5A5A5A] font-mono text-[11px]">admin@examportal.edu</span>
                </div>
                <div className="p-2 bg-[#FAF7F0] rounded-lg">
                  <span className="font-semibold text-[#0B3D2E] block">Teacher:</span>
                  <span className="text-[#5A5A5A] font-mono text-[11px]">teacher@examportal.edu</span>
                </div>
                <div className="p-2 bg-[#FAF7F0] rounded-lg">
                  <span className="font-semibold text-[#0B3D2E] block">Student:</span>
                  <span className="text-[#5A5A5A] font-mono text-[11px]">student@examportal.edu</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#0B3D2E]">
              Designed for Rigor and Seamless Flow
            </h2>
            <p className="mt-2 text-sm text-[#5A5A5A]">
              Every touchpoint adheres to the highest standards of reliability, transparency, and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card goldBorder>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#DFC775] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Administrative Governance
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  Oversee all system activity, view institution-wide metrics, manage student and educator permissions, and activate or suspend accounts with a click.
                </p>
              </CardContent>
            </Card>

            <Card goldBorder>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#DFC775] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Faculty Exam Studio
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  Craft complex MCQ and True/False assessments, schedule exam windows, toggle draft/published status, and review automated grading analytics.
                </p>
              </CardContent>
            </Card>

            <Card goldBorder>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#DFC775] flex items-center justify-center">
                  <Timer className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">
                  Student Exam Arena
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  Interactive countdown timer, question navigator with review flagging, multi-tab lockouts, instant scorecard breakdown, and comprehensive attempt histories.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DFC775]/40 bg-[#FCFBF8] py-8 text-center text-xs text-[#5A5A5A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0B3D2E]" />
            <span className="font-serif font-bold text-sm text-[#0B3D2E]">AuraExam Portal</span>
          </div>
          <p>© {new Date().getFullYear()} AuraExam Academic Systems. Production-Ready Edition.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-[#0B3D2E]">Sign In</Link>
            <Link href="/signup" className="hover:text-[#0B3D2E]">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
