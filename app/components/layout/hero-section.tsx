'use client';

import React, { memo } from 'react';

import { useSidebar } from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';
import { SECTION_WIDTH } from '@/variables/constants';

interface HeroSectionProps {
  /** 히어로 섹션의 제목 */
  title: string;
  /** 히어로 섹션의 내용 */
  content: string;
  /** 상단에 표시될 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 하단에 표시될 자식 요소들 (선택사항) */
  children?: React.ReactNode;
  /** 추가 CSS 클래스 (선택사항) */
  className?: string;
}

export const HeroSection = memo(function HeroSection({
  title,
  content,
  icon,
  children,
  className,
}: HeroSectionProps) {
  const { state } = useSidebar();

  return (
    <section
      className={cn(
        'relative flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-white dark:from-[#23243a] dark:to-[#181926] rounded-3xl overflow-hidden transition-[width] duration-200',
        state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED,
        className
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-10">
        {icon && <div className="mb-6">{icon}</div>}
        <h1 className="text-4xl md:text-5xl font-bold text-[#222] dark:text-white mb-4 leading-tight">
          {title}
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-[#5b6b7a] dark:text-neutral-300 mb-8">
          {content}
        </p>
        {children && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {children}
          </div>
        )}
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
