import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "default" | "lg";
}

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - Crystal-like appearance
          "relative inline-flex items-center justify-center font-semibold",
          "rounded-full overflow-hidden cursor-pointer select-none",
          "transition-all duration-300 ease-out",

          // Glass effect with depth
          "backdrop-blur-2xl",

          // Multiple layered borders for thickness/refraction
          "border border-white/30",

          // Inner highlight for 3D glass depth
          "before:absolute before:inset-0 before:rounded-full",
          "before:bg-gradient-to-b before:from-white/40 before:via-white/10 before:to-transparent",
          "before:pointer-events-none before:transition-all before:duration-300",

          // Bottom edge highlight (refraction)
          "after:absolute after:inset-x-4 after:bottom-0 after:h-[1px]",
          "after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent",
          "after:pointer-events-none",

          // Hover & Active states
          "hover:scale-[1.03]",
          "active:scale-[0.98] active:brightness-95",

          // Focus
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",

          // Variant: Primary (blood red → dark green on hover)
          variant === "primary" && [
            "bg-gradient-to-b from-red-600/90 via-red-700/85 to-red-800/90",
            "text-white",
            "shadow-[0_0_20px_rgba(220,38,38,0.5),0_4px_30px_rgba(220,38,38,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "hover:from-green-700/90 hover:via-green-800/85 hover:to-green-900/90",
            "hover:shadow-[0_0_30px_rgba(22,101,52,0.6),0_8px_40px_rgba(22,101,52,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]",
          ],

          // Variant: Secondary (frosted glass → dark green on hover)
          variant === "secondary" && [
            "bg-white/10",
            "text-white",
            "shadow-[0_4px_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "hover:bg-gradient-to-b hover:from-green-700/90 hover:via-green-800/85 hover:to-green-900/90",
            "hover:shadow-[0_0_30px_rgba(22,101,52,0.6),0_8px_40px_rgba(22,101,52,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]",
          ],

          // Sizes
          size === "default" && "h-10 px-6 text-sm",
          size === "lg" && "h-12 px-8 text-base",

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
