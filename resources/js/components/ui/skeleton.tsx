import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md",
        // Enhanced visibility with gradient and border
        "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
        "border border-primary/15",
        // Theme-aware background fallback
        "dark:from-primary/25 dark:via-primary/15 dark:to-primary/25",
        "dark:border-primary/20",
        // Shimmer animation for better loading indication
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
