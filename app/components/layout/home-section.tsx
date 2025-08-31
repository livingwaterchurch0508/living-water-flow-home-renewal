import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

import { useSidebar } from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';
import { SECTION_WIDTH } from '@/variables/constants';

interface IHomeSection {
  path: string;
  title: string;
  viewAll: string;
  children: ReactNode;
}

export default function HomeSection({ path, title, viewAll, children }: IHomeSection) {
  const { state } = useSidebar();

  return (
    <motion.section
      className={cn(
        'space-y-12 transition-[width] duration-200',
        state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <span className="text-primary font-semibold text-lg tracking-wide uppercase">
          {title.split(' ')[0]}
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-6">
          {title}
        </h2>
        <div className="flex items-center justify-center">
          <Link
            data-testid="hymn-view-all"
            href={`/${path}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            <span>{viewAll}</span>
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </Link>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
