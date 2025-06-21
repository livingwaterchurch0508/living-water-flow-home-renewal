'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UsersIcon } from 'lucide-react';

import { useSidebar } from '@/components/ui/sidebar';
import { PastorContent } from '@/components/introduces/PastorContent';
import { ChurchContent } from '@/components/introduces/ChurchContent';
import { WorshipContent } from '@/components/introduces/WorshipContent';
import { HeroSection } from '@/components/layout/hero-section';
import { TabSection } from '@/components/layout/tab-section';

import { cn } from '@/lib/utils';
import { INTRODUCE_TAB } from '@/variables/enums';
import { SECTION_WIDTH } from '@/variables/constants';

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

  const tabs = useMemo<TabItem[]>(
    () => [
      { id: INTRODUCE_TAB.PASTOR, label: menuT('Introduce.pastor') },
      { id: INTRODUCE_TAB.CHURCH, label: menuT('Introduce.introduce') },
      { id: INTRODUCE_TAB.WORSHIP, label: menuT('Introduce.worship') },
    ],
    [menuT]
  );

  const sectionClassName = cn(
    'transition-[width] duration-200',
    state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
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
    <div className="min-h-screen py-10 pb-20 px-6">
      <HeroSection
        title={menuT('Introduce.name')}
        content={menuT('Introduce.content')}
        icon={<UsersIcon className="w-16 h-16 mb-6 text-indigo-500/80" />}
      />

      <TabSection
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor="bg-indigo-500"
      />

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
