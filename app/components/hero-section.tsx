import React from 'react';

import { TextReveal } from '@/app/components/magicui/text-reveal';
import { useSidebar } from '@/app/components/ui/sidebar';

import { cn } from '@/app/lib/utils';

interface IHeroSection {
  title: string;
  content: string;
  icon?: React.ReactNode;
  bg1: string;
  bg2: string;
  bgDark1: string;
  bgDark2: string;
  color1: string;
  color2: string;
  colorDark1: string;
  colorDark2: string;
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  content,
  icon,
  bg1,
  bg2,
  bgDark1,
  bgDark2,
  color1,
  color2,
  colorDark1,
  colorDark2,
  children,
}: IHeroSection) {
  const { state } = useSidebar();

  return (
    <section
      className={cn(
        'relative h-[600px] transition-[width] duration-200 rounded-3xl overflow-hidden',
        state === 'expanded' ? 'w-full md:w-[calc(100vw-270px)]' : 'w-full md:w-[calc(100vw-62px)]'
      )}
    >
      {/* 배경 그라데이션 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bg1} ${bg2} ${bgDark1} ${bgDark2}`} />

      {/* 배경 패턴 */}
      <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />

      {/* 콘텐츠 */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        {icon && icon}
        <TextReveal
          text={title}
          className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${color1} ${color2} ${colorDark1} ${colorDark2}`}
        />
        <TextReveal
          text={content}
          className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8 whitespace-pre-line"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">{children && children}</div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>
  );
}
