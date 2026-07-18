import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground',
        primary: 'bg-foreground text-background',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
