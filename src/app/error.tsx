"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F0]">
      <Card className="max-w-md w-full border-[#8B1E1E] text-center shadow-luxury">
        <CardContent className="pt-6 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-[#FBEBEB] text-[#8B1E1E]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#8B1E1E]">
            An Unexpected System Error Occurred
          </h2>
          <p className="text-sm text-[#5A5A5A] leading-relaxed">
            {error.message || "A secure session failure or database connection issue has occurred. We have logged this occurrence."}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => reset()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="primary"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
