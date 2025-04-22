'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapIcon } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useSidebar } from '@/app/components/ui/sidebar';
import { TextReveal } from '@/app/components/magicui/text-reveal';
import { BorderBeam } from '@/app/components/magicui/border-beam';
import Location from '@/app/components/cards/Location';

export default function InfosPage() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const { state } = useSidebar();

  return (
    <div className="min-h-screen py-10 px-2 space-y-16">
      {/* 히어로 섹션 */}
      <section
        className={cn(
          'relative h-[600px] transition-[width] duration-200 rounded-3xl overflow-hidden',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10" />

        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />

        {/* 콘텐츠 */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <MapIcon className="w-16 h-16 mb-6 text-cyan-500/80" />
          <TextReveal
            text={t('Info.title')}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400"
          />
          <TextReveal
            text={t('Info.description')}
            className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8 whitespace-pre-line"
          />
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 지도 및 오시는 길 섹션 */}
      <section
        className={cn(
          'transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100">
          <BorderBeam className="opacity-20" />
          <div className="relative z-10 p-8">
            <TextReveal
              text={menuT('Info.name')}
              className="text-3xl font-bold mb-8 bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent"
            />
            <Location />
          </div>
        </div>
      </section>
    </div>
  );
} 