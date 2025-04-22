import { cn } from '@/app/lib/utils';
import { useSidebar } from './sidebar';

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

  return (
    <section
      className={cn(
        'transition-[width] duration-200',
        state === 'expanded'
          ? 'w-full md:w-[calc(100vw-270px)]'
          : 'w-full md:w-[calc(100vw-62px)]',
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
              activeTab === tab.id
                ? cn(accentColor, 'text-white')
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
} 