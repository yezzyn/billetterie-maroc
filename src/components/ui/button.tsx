'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'gradient-primary text-white shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95',
        secondary:
          'border-2 border-blue-100 bg-white text-blue-600 shadow-lg hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-xl',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
        ghost: 'text-blue-600 hover:bg-blue-50',
        destructive:
          'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700',
        success:
          'gradient-secondary text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl'
      },
      size: {
        default: 'px-8 py-4 text-base',
        sm: 'px-5 py-3 text-sm',
        lg: 'px-10 py-5 text-lg',
        xl: 'px-12 py-6 text-xl',
        icon: 'h-12 w-12'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="me-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
