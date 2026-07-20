"use client";

import React from "react";

interface StatusToggleProps {
  label: string;
  ativo: boolean;
  data?: string;
  onClick: () => void;
}

export default function StatusToggle({
  label,
  ativo,
  data,
  onClick,
}: StatusToggleProps) {
  return (
    <div className="flex items-center justify-between w-full min-w-0 bg-zinc-900 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:border-zinc-700/60 shadow-xs">
      <span
        className={`min-w-0 flex-1 break-words text-xs font-semibold tracking-wide transition-colors duration-250 ${
          ativo ? "text-lime-400" : "text-zinc-300"
        }`}
      >
        {label}
      </span>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        {data && (
          <span className="text-xs text-zinc-400 font-medium flex-shrink-0 bg-black/40 px-2 py-0.5 rounded-md">
            {data}
          </span>
        )}

        <button
          onClick={onClick}
          role="switch"
          aria-checked={ativo}
          className="relative h-5 w-9 shrink-0 bg-zinc-800 rounded-full cursor-pointer focus:ring-1 focus:ring-lime-500/50 outline-none transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div
            className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-200 ease-out ${
              ativo
                ? "translate-x-5 bg-lime-400"
                : "translate-x-1 bg-red-500"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
