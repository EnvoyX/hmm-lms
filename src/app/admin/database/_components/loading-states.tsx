"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "~/components/ui/table";

interface TableLoadingProps {
  columns: number;
  rows?: number;
}

export function TableLoading({ columns, rows = 15 }: TableLoadingProps) {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow
              key={rowIndex}
              className=""
              style={{
                animationDelay: `${rowIndex * 0.05}s`
              }}
            >
              {/* Selection checkbox */}
              <TableCell className="pl-6">
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-full rounded-sm animate-pulse" />
                </div>
              </TableCell>

              {/* Dynamic content cells */}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="px-4 py-3">
                  <Skeleton
                    className="h-4 animate-pulse"
                    style={{
                      width: `${Math.random() * 60 + 40}%`,
                      animationDelay: `${(rowIndex * columns + colIndex) * 0.02}s`
                    }}
                  />
                </TableCell>
              ))}

              {/* Actions cell */}
              <TableCell className="pr-6">
                <div className="flex items-center justify-end space-x-2">
                  <Skeleton className="h-4 w-8 rounded-md animate-pulse" />
                  <Skeleton className="h-4 w-8 rounded-md animate-pulse" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TabsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 p-1 bg-muted/30 rounded-lg w-fit backdrop-blur-sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 rounded-md animate-pulse"
            style={{
              width: `${Math.random() * 30 + 70}px`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Table Content */}
      <TableLoading columns={6} />
    </div>
  );
}

export function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-6 border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300"
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        >
          {/* Stat label */}
          <Skeleton
            className="h-4 mb-3 animate-pulse"
            style={{
              width: `${Math.random() * 40 + 60}px`,
              animationDelay: `${i * 0.15}s`
            }}
          />

          {/* Main stat value */}
          <Skeleton
            className="h-8 mb-2 animate-pulse"
            style={{
              width: `${Math.random() * 30 + 50}px`,
              animationDelay: `${i * 0.2}s`
            }}
          />

          {/* Subtitle/change indicator */}
          <div className="flex items-center space-x-2">
            <Skeleton
              className="h-3 animate-pulse"
              style={{
                width: `${Math.random() * 20 + 40}px`,
                animationDelay: `${i * 0.25}s`
              }}
            />
            <Skeleton
              className="h-3 w-12 animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function InlineLoading({ text = "Loading...", size = "sm" }: InlineLoadingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex items-center justify-center space-x-3 p-4 text-muted-foreground">
      <LoadingSpinner size={size} />
      <span className={`${sizeClasses[size]} font-medium animate-pulse`}>
        {text}
      </span>
    </div>
  );
}

// Bonus: Enhanced page loading component
export function PageLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 animate-pulse" />
        <Skeleton className="h-4 w-96 animate-pulse" style={{ animationDelay: '0.1s' }} />
      </div>

      {/* Stats */}
      <StatsLoading />

      {/* Tabs and table */}
      <TabsLoading />
    </div>
  );
}

// Bonus: Card loading component
export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm space-y-4"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 animate-pulse" />
              <Skeleton className="h-3 w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full animate-pulse" />
            <Skeleton className="h-3 w-4/5 animate-pulse" />
            <Skeleton className="h-3 w-3/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}