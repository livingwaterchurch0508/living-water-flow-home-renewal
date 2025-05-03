import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { useSidebar } from '@/app/components/ui/sidebar';
import { cn } from '@/app/lib/utils';
import { SECTION_WIDTH } from '@/app/variables/constants';

interface IHomeSection {
  path: string;
  title: string;
  viewAll: string;
  children: ReactNode;
}

export default function HomeSection({ path, title, viewAll, children }: IHomeSection) {
  const { state } = useSidebar();

  return (
    <section
      className={cn(
        'space-y-8 transition-[width] duration-200',
        state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Link
          data-testid="hymn-view-all"
          href={`/${path}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {viewAll}
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
