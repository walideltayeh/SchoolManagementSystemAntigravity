import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-apple-blue text-white",
        secondary:
          "border-transparent bg-apple-gray-100 text-apple-gray-700",
        destructive:
          "border-transparent bg-apple-red text-white",
        outline: "border-apple-gray-200 text-apple-gray-600 bg-transparent",
        success:
          "border-transparent bg-apple-green text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
