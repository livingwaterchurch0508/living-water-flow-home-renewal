'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapIcon } from 'lucide-react';

import { useSidebar } from '@/app/components/ui/sidebar';
import { TextReveal } from '@/app/components/magicui/text-reveal';
import { BorderBeam } from '@/app/components/magicui/border-beam';
import Location from '@/app/components/cards/Location';
import { HeroSection } from '@/app/components/hero-section';

import { cn } from '@/app/lib/utils';
import { SECTION_WIDTH } from '@/app/variables/constants';

export default function InfosPage() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const { state } = useSidebar();

  return (
    <div className="min-h-screen py-10 pb-20 px-2 space-y-16">
      <HeroSection
        title={t('Info.title')}
        content={t('Info.description')}
        bg1="from-cyan-500/20"
        bg2="to-blue-500/20"
        bgDark1="dark:from-cyan-500/10"
        bgDark2="dark:to-blue-500/10"
        color1="from-cyan-600"
        color2="to-blue-600"
        colorDark1="dark:from-cyan-400"
        colorDark2="dark:to-blue-400"
        icon={<MapIcon className="w-16 h-16 mb-6 text-cyan-500/80" />}
      />

      {/* 지도 및 오시는 길 섹션 */}
      <section
        className={cn(
          'transition-[width] duration-200',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
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
