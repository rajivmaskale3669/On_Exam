import React from "react";

export type BadgeVariant =
  | "admin"
  | "teacher"
  | "student"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "gold";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    admin: "bg-[#0E2A47]/10 text-[#0E2A47] border border-[#0E2A47]/30",
    teacher: "bg-[#0B3D2E]/10 text-[#0B3D2E] border border-[#0B3D2E]/30 font-medium",
    student: "bg-[#166534]/10 text-[#166534] border border-[#166534]/30",
    success: "bg-[#E7F2EE] text-[#166534] border border-[#BBD5CB]",
    warning: "bg-[#FDF4D4] text-[#A68218] border border-[#DFC775]",
    danger: "bg-[#FBEBEB] text-[#8B1E1E] border border-[#E8B3B3]",
    neutral: "bg-[#F4EFE2] text-[#5A5A5A] border border-[#E5E1D8]",
    gold: "bg-[#FDF4D4] text-[#A68218] border border-[#C9A227] font-semibold",
  };

  const dotColors: Record<BadgeVariant, string> = {
    admin: "bg-[#0E2A47]",
    teacher: "bg-[#0B3D2E]",
    student: "bg-[#166534]",
    success: "bg-[#166534]",
    warning: "bg-[#C9A227]",
    danger: "bg-[#8B1E1E]",
    neutral: "bg-[#8C8C8C]",
    gold: "bg-[#C9A227]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
