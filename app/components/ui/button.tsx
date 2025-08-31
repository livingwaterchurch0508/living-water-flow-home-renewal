import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transform hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:shadow-xl transform hover:-translate-y-0.5',
        outline:
          'border-2 border-primary bg-transparent text-primary shadow-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl transform hover:-translate-y-0.5',
        secondary: 'bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:shadow-xl transform hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:from-primary/90 hover:to-primary/70 hover:shadow-xl transform hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-6 py-2.5 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-4 py-2 has-[>svg]:px-3',
        lg: 'h-12 rounded-lg px-8 py-3 text-base has-[>svg]:px-6',
        xl: 'h-14 rounded-xl px-10 py-4 text-lg has-[>svg]:px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps extends React.ComponentProps<'button'>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withAnimation?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  withAnimation = true,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  if (withAnimation) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
