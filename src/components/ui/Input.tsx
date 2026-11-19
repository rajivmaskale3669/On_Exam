import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      showPasswordToggle = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPassword = type === "password" || (showPasswordToggle && !showPassword);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wider uppercase text-[#0B3D2E]"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A5A5A]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
            className={`w-full rounded-lg bg-[#FCFBF8] border text-[#2B2B2B] text-sm transition-colors duration-150 placeholder-[#8C8C8C] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${showPasswordToggle ? "pr-10" : "pr-3.5"} py-2.5 ${
              error
                ? "border-[#8B1E1E] focus:ring-[#8B1E1E] bg-[#FBEBEB]/30"
                : "border-[#DFC775]/60 hover:border-[#C9A227]"
            } ${className}`}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5A5A5A] hover:text-[#0B3D2E] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs font-medium text-[#8B1E1E] mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#5A5A5A] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
