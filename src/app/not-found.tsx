"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F0]">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#0B3D2E] border-2 border-[#C9A227] mx-auto flex items-center justify-center text-[#DFC775] shadow-luxury mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <span className="font-serif text-3xl font-bold text-[#0B3D2E]">
          Aura<span className="text-[#C9A227]">Exam</span>
        </span>
      </div>

      <Card goldBorder className="max-w-md w-full text-center">
        <CardContent className="pt-6 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-[#FBEBEB] text-[#8B1E1E]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">
            Page Not Found (404)
          </h2>
          <p className="text-sm text-[#5A5A5A] leading-relaxed">
            The requested examination resource, candidate record, or portal page could not be located on the server.
          </p>
          <div className="pt-4 flex justify-center">
            <Link href="/">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Portal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
