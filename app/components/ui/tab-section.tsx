import { useEffect, useRef, useState } from 'react';

import { useSidebar } from './sidebar';

import { cn } from '@/app/lib/utils';
import { SECTION_WIDTH } from '@/app/variables/constants';

interface Tab<T> {
  id: T;
  label: string;
}

interface TabSectionProps<T> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  accentColor?: string;
  className?: string;
}

export function TabSection<T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
  accentColor = 'bg-rose-500',
  className,
}: TabSectionProps<T>) {
  const { state } = useSidebar();
  const [showDock, setShowDock] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDock(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-1px 0px 0px 0px',
      }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className={cn(
          'transition-[width] duration-200',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED,
          className
        )}
      >
        <div className="flex justify-center space-x-4 mb-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={cn(
                'px-6 py-2 rounded-full transition-colors',
                activeTab === tab.id ? cn(accentColor, 'text-white') : 'bg-muted hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Dock Style Navigation */}
      <div
        className={cn(
          'fixed right-4 top-1/2 -translate-y-1/2 z-50',
          'flex flex-col gap-2 p-2 rounded-full',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'shadow-lg border border-border',
          'transition-all duration-300 ease-in-out',
          showDock ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'transition-colors hover:bg-muted/80',
              activeTab === tab.id ? cn(accentColor, 'text-white') : 'bg-muted'
            )}
            title={tab.label}
          >
            {/* 탭 라벨의 첫 글자를 아이콘으로 사용 */}
            <span className="text-sm font-medium">{tab.label.charAt(0)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
