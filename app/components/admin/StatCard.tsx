'use client';

import React from 'react';
import { BorderBeam } from '@/components/magicui/border-beam';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  count: number | string;
  details: string;
  isSelected: boolean;
  onClick: () => void;
  colorScheme: 'blue' | 'green' | 'purple';
  isLoading?: boolean;
}

const COLOR_SCHEMES = {
  blue: {
    border: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
    text: 'text-blue-600 dark:text-blue-400',
    beamFrom: '#60a5fa',
    beamTo: '#818cf8',
  },
  green: {
    border: 'border-green-500 bg-green-50 dark:bg-green-900/10',
    text: 'text-green-600 dark:text-green-400',
    beamFrom: '#34d399',
    beamTo: '#60a5fa',
  },
  purple: {
    border: 'border-purple-500 bg-purple-50 dark:bg-purple-900/10',
    text: 'text-purple-600 dark:text-purple-400',
    beamFrom: '#a78bfa',
    beamTo: '#f472b6',
  },
};

export function StatCard({
  title,
  count,
  details,
  isSelected,
  onClick,
  colorScheme,
  isLoading = false,
}: StatCardProps) {
  const scheme = COLOR_SCHEMES[colorScheme];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-6 rounded-xl shadow overflow-hidden cursor-pointer transition-all border-2',
        isSelected ? scheme.border : 'border-transparent bg-white dark:bg-zinc-900'
      )}
      onClick={onClick}
    >
      <BorderBeam className="opacity-30" colorFrom={scheme.beamFrom} colorTo={scheme.beamTo} />
      <span className="text-lg font-semibold">{title}</span>
      <span className={cn('text-2xl font-bold', scheme.text)}>
        {isLoading ? '...' : count}
      </span>
      <span className="text-sm mt-2 text-muted-foreground">{details}</span>
    </div>
  );
}
