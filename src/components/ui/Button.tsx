import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost" | "maroon";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#0B3D2E] text-white hover:bg-[#082F24] border border-[#C9A227] shadow-luxury focus:ring-[#0B3D2E]",
      gold:
        "bg-[#C9A227] text-[#0B3D2E] font-semibold hover:bg-[#DFC775] border border-[#A68218] shadow-luxury focus:ring-[#C9A227]",
      outline:
        "bg-transparent text-[#0B3D2E] border-2 border-[#0B3D2E] hover:bg-[#E7F2EE] focus:ring-[#0B3D2E]",
      ghost:
        "bg-transparent text-[#2B2B2B] hover:bg-[#F4EFE2] hover:text-[#0B3D2E] focus:ring-[#C9A227]",
      maroon:
        "bg-[#8B1E1E] text-white hover:bg-[#731818] border border-[#E8B3B3] shadow-luxury focus:ring-[#8B1E1E]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
