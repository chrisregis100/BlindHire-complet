import { ButtonHTMLAttributes, ElementType, ReactNode } from "react";

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  as?: ElementType;
  href?: string;
}

export function PrimaryButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  as: Component = "button",
  ...props
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover hover:scale-[1.02] active:scale-100",
    secondary:
      "border border-border bg-surface-hover text-foreground hover:bg-border active:scale-95",
    ghost:
      "text-muted-foreground hover:text-foreground hover:bg-surface-hover active:scale-95",
    danger:
      "bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] active:scale-100",
  };

  return (
    <Component
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
