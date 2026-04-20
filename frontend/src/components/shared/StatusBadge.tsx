import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success:  "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-800",
        destructive: "bg-destructive/15 text-destructive",
        info: "bg-blue-100 text-blue-700",
        muted: "bg-gray-50 text-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type StatusBadgeVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
