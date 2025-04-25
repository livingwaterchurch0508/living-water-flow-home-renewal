'use client';

import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(className)}
    >
      {text}
    </motion.div>
  );
}
