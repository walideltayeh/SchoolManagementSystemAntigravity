import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-apple-blue text-white hover:bg-blue-600 shadow-sm hover:shadow-md hover:shadow-blue-500/20",
        destructive:
          "bg-apple-red text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500/20",
        outline:
          "border border-apple-gray-200 bg-white text-apple-gray-700 hover:bg-apple-gray-50 hover:border-apple-gray-300",
        secondary:
          "bg-apple-gray-100 text-apple-gray-800 hover:bg-apple-gray-200 shadow-sm",
        ghost: "hover:bg-apple-gray-100 text-apple-gray-600 hover:text-apple-gray-800",
        link: "text-apple-blue underline-offset-4 hover:underline",
        blue: "bg-apple-blue text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:shadow-blue-500/25",
        "blue-outline": "border-2 border-apple-blue bg-transparent text-apple-blue hover:bg-apple-blue hover:text-white",
        "blue-ghost": "text-apple-blue hover:bg-blue-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
