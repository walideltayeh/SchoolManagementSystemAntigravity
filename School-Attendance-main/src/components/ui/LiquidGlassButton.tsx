import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "light-primary" | "light-secondary" | "light-ghost";
  size?: "default" | "lg" | "sm";
}

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center font-semibold",
          "rounded-full overflow-hidden cursor-pointer select-none",
          "transition-all duration-300 ease-out",

          // Hover & Active states
          "hover:scale-[1.03]",
          "active:scale-[0.98] active:brightness-95",

          // === DARK THEME VARIANTS (for dark backgrounds) ===

          // Variant: Primary (blood red → dark green on hover)
          variant === "primary" && [
            "backdrop-blur-2xl border border-white/30",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-b before:from-white/40 before:via-white/10 before:to-transparent",
            "before:pointer-events-none before:transition-all before:duration-300",
            "after:absolute after:inset-x-4 after:bottom-0 after:h-[1px]",
            "after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent",
            "after:pointer-events-none",
            "bg-gradient-to-b from-red-600/90 via-red-700/85 to-red-800/90",
            "text-white",
            "shadow-[0_0_10px_rgba(220,38,38,0.3),0_2px_15px_rgba(220,38,38,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "hover:from-green-700/90 hover:via-green-800/85 hover:to-green-900/90",
            "hover:shadow-[0_0_15px_rgba(22,101,52,0.4),0_4px_20px_rgba(22,101,52,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          ],

          // Variant: Secondary (frosted glass → dark green on hover)
          variant === "secondary" && [
            "backdrop-blur-2xl border border-white/30",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-b before:from-white/40 before:via-white/10 before:to-transparent",
            "before:pointer-events-none before:transition-all before:duration-300",
            "after:absolute after:inset-x-4 after:bottom-0 after:h-[1px]",
            "after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent",
            "after:pointer-events-none",
            "bg-white/10",
            "text-white",
            "shadow-[0_4px_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "hover:bg-gradient-to-b hover:from-green-700/90 hover:via-green-800/85 hover:to-green-900/90",
            "hover:shadow-[0_0_15px_rgba(22,101,52,0.4),0_4px_20px_rgba(22,101,52,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          ],

          // Variant: Ghost (text only - dark theme)
          variant === "ghost" && [
            "bg-transparent",
            "text-white/80 border-transparent",
            "hover:text-white hover:bg-white/10",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
          ],

          // === LIGHT THEME VARIANTS (for light backgrounds) ===

          // Variant: Light Primary - Apple Blue solid
          variant === "light-primary" && [
            "bg-[#0071e3] text-white",
            "hover:bg-[#0077ed]",
            "active:bg-[#006edb]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2",
          ],

          // Variant: Light Secondary - Subtle gray
          variant === "light-secondary" && [
            "bg-[#f5f5f7] text-[#1d1d1f]",
            "hover:bg-[#e8e8ed]",
            "active:bg-[#d2d2d7]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/30 focus-visible:ring-offset-2",
          ],

          // Variant: Light Ghost - Text link style
          variant === "light-ghost" && [
            "bg-transparent text-[#0071e3]",
            "hover:bg-[#0071e3]/10",
            "active:bg-[#0071e3]/15",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/30 focus-visible:ring-offset-2",
          ],

          // Sizes
          size === "sm" && "h-9 px-5 text-sm",
          size === "default" && "h-11 px-7 text-base",
          size === "lg" && "h-14 px-10 text-lg",

          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 drop-shadow-sm">{children}</span>
      </button>
    );
  }
);

LiquidGlassButton.displayName = "LiquidGlassButton";

export { LiquidGlassButton };
