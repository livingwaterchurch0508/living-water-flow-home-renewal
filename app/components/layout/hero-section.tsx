'use client';

import React, { memo } from 'react';

import { TextReveal } from '@/app/components/magicui/text-reveal';
import { useSidebar } from '@/app/components/ui/sidebar';

import { cn } from '@/app/lib/utils';
import { SECTION_WIDTH } from '@/app/variables/constants';

interface HeroSectionProps {
  /** 히어로 섹션의 제목 */
  title: string;
  /** 히어로 섹션의 내용 */
  content: string;
  /** 상단에 표시될 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 배경 그라데이션 클래스 (라이트 모드) */
  bg1: string;
  bg2: string;
  /** 배경 그라데이션 클래스 (다크 모드) */
  bgDark1: string;
  bgDark2: string;
  /** 텍스트 그라데이션 클래스 (라이트 모드) */
  color1: string;
  color2: string;
  /** 텍스트 그라데이션 클래스 (다크 모드) */
  colorDark1: string;
  colorDark2: string;
  /** 하단에 표시될 자식 요소들 (선택사항) */
  children?: React.ReactNode;
  /** 추가 CSS 클래스 (선택사항) */
  className?: string;
}

// 배경 그라데이션 컴포넌트
const BackgroundGradient = memo(
  ({
    bg1,
    bg2,
    bgDark1,
    bgDark2,
  }: Pick<HeroSectionProps, 'bg1' | 'bg2' | 'bgDark1' | 'bgDark2'>) => (
    <div className={cn('absolute inset-0 bg-gradient-to-br', bg1, bg2, bgDark1, bgDark2)} />
  )
);

BackgroundGradient.displayName = 'BackgroundGradient';

// 배경 패턴 컴포넌트
const BackgroundPattern = memo(() => (
  <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />
));

BackgroundPattern.displayName = 'BackgroundPattern';

// 하단 그라데이션 장식 컴포넌트
const BottomDecoration = memo(() => (
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
));

BottomDecoration.displayName = 'BottomDecoration';

// 메인 컨텐츠 컴포넌트
const Content = memo(
  ({
    title,
    content,
    icon,
    color1,
    color2,
    colorDark1,
    colorDark2,
    children,
  }: Pick<
    HeroSectionProps,
    'title' | 'content' | 'icon' | 'color1' | 'color2' | 'colorDark1' | 'colorDark2'
  > & { children?: React.ReactNode }) => (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
      {icon && icon}
      <TextReveal
        text={title}
        className={cn(
          'text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r',
          color1,
          color2,
          colorDark1,
          colorDark2
        )}
      />
      <TextReveal
        text={content}
        className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8 whitespace-pre-line"
      />
      {children && <div className="flex flex-col sm:flex-row gap-4 justify-center">{children}</div>}
      <BottomDecoration />
    </div>
  )
);

Content.displayName = 'Content';

export const HeroSection = memo(function HeroSection({
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
  className,
}: HeroSectionProps) {
  const { state } = useSidebar();

  return (
    <section
      className={cn(
        'relative h-[600px] transition-[width] duration-200 rounded-3xl overflow-hidden',
        state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED,
        className
      )}
    >
      <BackgroundGradient bg1={bg1} bg2={bg2} bgDark1={bgDark1} bgDark2={bgDark2} />
      <BackgroundPattern />
      <Content
        title={title}
        content={content}
        icon={icon}
        color1={color1}
        color2={color2}
        colorDark1={colorDark1}
        colorDark2={colorDark2}
      >
        {children}
      </Content>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
