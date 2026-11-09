import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
  {
    variants: {
      // One solid color at a time, by design: `default` carries every
      // primary action; everything else recedes (outline/ghost/link) so a
      // page never shows two competing filled colors side by side. `gold`
      // is reserved for a single rare emphasis moment, not routine CTAs.
      variant: {
        default: "bg-brand-blue text-white hover:bg-brand-blue/90",
        secondary: "border border-brand-navy/15 bg-transparent text-brand-navy hover:border-brand-navy/30 hover:bg-brand-navy/[0.03]",
        gold: "bg-brand-gold text-brand-navy hover:bg-brand-gold/90",
        outline: "border border-border bg-transparent text-brand-navy hover:bg-muted",
        ghost: "text-brand-navy hover:bg-muted",
        link: "text-brand-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
