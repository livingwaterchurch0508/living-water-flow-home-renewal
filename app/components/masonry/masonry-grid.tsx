import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

interface MasonryChildProps {
  span?: number;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={cn(
        'grid auto-rows-[15px] gap-4',
        'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {childrenArray.map((child, index) => {
        if (!React.isValidElement<MasonryChildProps>(child)) return null;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="w-full rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            style={{
              gridRow: `span ${child.props.span || 12}`,
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}

interface MasonryItemProps {
  children: React.ReactNode;
  span?: number;
  className?: string;
}

export function MasonryItem({ children, className, span }: MasonryItemProps) {
  return (
    <div 
      className={cn('h-full w-full rounded-xl overflow-hidden', className)}
      style={{ gridRow: `span ${span || 12}` }}
    >
      {children}
    </div>
  );
} 