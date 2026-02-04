"use client";

import {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
  Suspense as ReactSuspense,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface BaseProps extends PropsWithChildren {
  fallback: ReactNode;
}

interface SpinnerProps extends Omit<BaseProps, "fallback"> {
  className?: string;
  size?: number;
}

interface SkeletonProps extends Omit<BaseProps, "fallback"> {
  className?: string;
  skeleton: ReactNode;
}

const SuspenseBase = ({ children, fallback }: BaseProps) => {
  return <ReactSuspense fallback={fallback}>{children}</ReactSuspense>;
};

const Spinner = ({ size = 24, className, ...rest }: SpinnerProps) => {
  return (
    <SuspenseBase
      fallback={
        <div
          className={cn(
            "flex h-[200px] items-center justify-center",
            className
          )}
        >
          <Loader2 size={size} className="animate-spin text-muted-foreground" />
        </div>
      }
      {...rest}
    />
  );
};

const Skeleton = ({ skeleton, className, ...rest }: SkeletonProps) => {
  return (
    <SuspenseBase
      fallback={<div className={className}>{skeleton}</div>}
      {...rest}
    />
  );
};

const CardSkeleton = ({
  count = 3,
  className,
  ...rest
}: Omit<BaseProps, "fallback"> & { count?: number; className?: string }) => {
  return (
    <SuspenseBase
      fallback={
        <div className={cn("flex flex-col gap-3", className)}>
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-muted" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      }
      {...rest}
    />
  );
};

export const Suspense = Object.assign(SuspenseBase, {
  Spinner,
  Skeleton,
  CardSkeleton,
});
