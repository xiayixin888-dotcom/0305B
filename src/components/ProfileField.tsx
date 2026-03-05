import React from 'react';

export function ProfileField({ label, value, type, time }: { label: string, value: string, type: string, time: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800/50 pb-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 rounded">{type}</span>
      </div>
      <div className="font-medium text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="text-[10px] text-zinc-400">{time}</div>
    </div>
  );
}
