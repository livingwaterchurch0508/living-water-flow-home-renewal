'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

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

  const handleScrollToContent = () => {
    // Hero Section 다음 요소로 스크롤
    const heroSection = document.querySelector('[data-hero-section]');
    if (heroSection) {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // 다음 섹션이 없으면 페이지 하단으로 스크롤
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <section
      data-hero-section
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-[width] duration-200 min-h-[80vh]',
        // Enhanced gradient with original theme
        'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80',
        'dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40',
        // Glassmorphism backdrop
        'backdrop-blur-xl border border-white/20 dark:border-white/10',
        // Shadow and glow effects
        'shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20',
        state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED,
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-indigo-400/30 to-blue-600/30 rounded-full blur-2xl"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-16">
        {icon && (
          <motion.div 
            className="mb-8 p-4 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        
        <motion.h1 
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {content}
        </motion.p>
        
        {children && (
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </div>
      
      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        onClick={handleScrollToContent}
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      </motion.button>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
