import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: "default" | "narrow" | "wide" | "full";
  innerClassName?: string;
}

const sizeClasses = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[1440px]",
  full: "max-w-full",
};

/**
 * Global Responsive Layout Container
 * Enforces strict horizontal alignment with the Navbar's inner content boundary:
 * Outer gutter: px-3 sm:px-6 lg:px-8
 * Inner boundary: max-w-7xl mx-auto px-4 sm:px-6 lg:px-7
 */
export function Container({
  as: Component = "div",
  size = "default",
  className,
  innerClassName,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("w-full px-3 sm:px-6 lg:px-8", className)}
      {...props}
    >
      <div
        className={cn(
          "w-full mx-auto px-4 sm:px-6 lg:px-7",
          sizeClasses[size],
          innerClassName
        )}
      >
        {children}
      </div>
    </Component>
  );
}
