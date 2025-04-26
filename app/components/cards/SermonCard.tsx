'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/app/components/ui/dialog';
import { BorderBeam } from '@/app/components/magicui/border-beam';

import { cn } from '@/app/lib/utils';

interface SermonCardProps {
  name: string;
  desc?: string;
  autoOpen?: boolean;
  onDialogClose?: () => void;
}

export function SermonCard({ name, desc, autoOpen = false, onDialogClose }: SermonCardProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);

  useEffect(() => {
    setIsOpen(autoOpen);
  }, [autoOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onDialogClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        data-testid="sermon-card-dialog-content"
        className={cn(
          'sm:max-w-xl border-none p-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
          'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]'
        )}
      >
        <div className="relative overflow-hidden rounded-lg">
          <DialogClose className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
            <BorderBeam className="opacity-20" />
            <motion.div
              className="relative z-10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DialogTitle asChild>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
                  {name}
                </h2>
              </DialogTitle>
              {desc && ( 
                <DialogDescription asChild>
                  <motion.div
                    className="prose prose-neutral dark:prose-invert max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="text-base leading-relaxed whitespace-pre-wrap">{desc}</div>
                  </motion.div>
                </DialogDescription>
              )}
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
