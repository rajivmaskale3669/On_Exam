"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountSuspendedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF7F0]">
      <Card className="max-w-md w-full border-[#8B1E1E]">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FBEBEB] border-2 border-[#8B1E1E] mx-auto flex items-center justify-center text-[#8B1E1E]">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#8B1E1E]">
            Account Suspended
          </h2>
          <p className="text-sm text-[#5A5A5A] leading-relaxed">
            Your academic access has been deactivated by the institutional administrator.
            Please contact the administration office or your faculty coordinator to reinstate access.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="w-full"
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
