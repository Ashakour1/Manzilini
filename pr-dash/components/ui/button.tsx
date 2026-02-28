import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2";
    const variants = {
      default: "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white",
      outline: "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]",
      ghost: "hover:bg-[var(--muted)]",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
    };
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 gap-1.5 px-3 text-xs",
      icon: "size-9",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
