"use client";

import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg animate-pulse space-y-4">
      {/* Header (Title & Badge) */}
      <div className="flex justify-between items-center">
        <div className="h-6 bg-zinc-800 rounded-lg w-2/3"></div>
        <div className="h-5 bg-zinc-800 rounded-md w-16"></div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="h-4 bg-zinc-800 rounded-md w-1/4"></div>
          <div className="h-4 bg-zinc-800 rounded-md w-1/2"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-zinc-800 rounded-md w-1/4"></div>
          <div className="h-4 bg-zinc-800 rounded-md w-1/3"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-zinc-800 rounded-md w-1/5"></div>
          <div className="h-4 bg-zinc-800 rounded-md w-2/3"></div>
        </div>
      </div>

      {/* Action Button */}
      <div className="h-10 bg-zinc-800 rounded-xl w-full mt-2"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 h-16 flex flex-col justify-between items-center">
          <div className="h-6 bg-zinc-800 rounded-md w-8"></div>
          <div className="h-3 bg-zinc-800 rounded-md w-16"></div>
        </div>
      ))}
    </div>
  );
}

export function RelatoriosSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 h-24"></div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 h-20"></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-64"></div>
    </div>
  );
}
