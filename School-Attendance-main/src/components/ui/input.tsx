import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-apple-gray-200 bg-white px-4 py-2 text-base text-apple-gray-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-apple-gray-800 placeholder:text-apple-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/20 focus-visible:border-apple-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-apple-gray-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
