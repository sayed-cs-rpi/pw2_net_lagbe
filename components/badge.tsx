import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground',
        primary: 'bg-foreground text-background',
        success: 'bg-secondary text-foreground/80',
        warning: 'border border-border bg-input text-foreground',
        danger: 'bg-destructive/10 text-destructive',
        critical: 'bg-destructive/15 text-destructive font-semibold',
        outline: 'border border-border text-foreground/70',
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
