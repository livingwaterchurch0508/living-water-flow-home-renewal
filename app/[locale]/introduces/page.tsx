'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { useSidebar } from '@/app/components/ui/sidebar';
import { INTRODUCE_TAB } from '@/app/variables/enums';
import { PastorContent } from '@/app/components/introduces/PastorContent';
import { ChurchContent } from '@/app/components/introduces/ChurchContent';
import { WorshipContent } from '@/app/components/introduces/WorshipContent';
import { UsersIcon } from 'lucide-react';

const CONTENT_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

interface TabItem {
  id: INTRODUCE_TAB;
  label: string;
}

export default function IntroducesPage() {
  const menuT = useTranslations('Menu');
  const { state } = useSidebar();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<INTRODUCE_TAB>(INTRODUCE_TAB.PASTOR);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type !== null) {
      const tabType = parseInt(type);
      if (Object.values(INTRODUCE_TAB).includes(tabType)) {
        setActiveTab(tabType);
      }
    }
  }, [searchParams]);

  const tabs = useMemo<TabItem[]>(() => [
    { id: INTRODUCE_TAB.PASTOR, label: menuT('Introduce.pastor') },
    { id: INTRODUCE_TAB.CHURCH, label: menuT('Introduce.introduce') },
    { id: INTRODUCE_TAB.WORSHIP, label: menuT('Introduce.worship') },
  ], [menuT]);

  const sectionClassName = cn(
    'transition-[width] duration-200',
    state === 'expanded'
      ? 'w-full md:w-[calc(100vw-270px)]'
      : 'w-full md:w-[calc(100vw-62px)]'
  );

  const renderContent = () => {
    switch (activeTab) {
      case INTRODUCE_TAB.PASTOR:
        return <PastorContent />;
      case INTRODUCE_TAB.CHURCH:
        return <ChurchContent />;
      case INTRODUCE_TAB.WORSHIP:
        return <WorshipContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-10 px-2 space-y-16">
      <section className={cn('relative h-[600px] rounded-3xl overflow-hidden', sectionClassName)}>
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10" />

        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />

        {/* 콘텐츠 */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <UsersIcon className="w-16 h-16 mb-6 text-indigo-500/80" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {menuT('Introduce.name')}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8">
            {menuT('Introduce.content')}
          </p>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 탭 섹션 */}
      <section className={sectionClassName}>
        <div className="flex justify-center space-x-4 mb-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={cn(
                'px-6 py-2 rounded-full transition-colors',
                activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-muted hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 콘텐츠 섹션 */}
      <section className={cn(sectionClassName, 'px-4 sm:px-6')}>
        <motion.div
          key={activeTab}
          {...CONTENT_ANIMATION}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {renderContent()}
        </motion.div>
      </section>
    </div>
  );
} 