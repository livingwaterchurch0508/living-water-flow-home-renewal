'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/app/components/ui/dialog';
import { BorderBeam } from '@/app/components/magicui/border-beam';

import { cn } from '@/app/lib/utils';
import { SOUL_TYPE } from '@/app/variables/enums';
import { useShare } from '@/app/hooks/use-share';

interface SermonCardProps {
  name: string;
  desc?: string;
  sermonType?: number | null;
  autoOpen?: boolean;
  onDialogClose?: () => void;
  id?: string;
  customUrl?: string;
}

export function SermonCard({
  name,
  desc,
  sermonType = SOUL_TYPE.INTRODUCE,
  autoOpen = false,
  onDialogClose,
  id,
  customUrl,
}: SermonCardProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const { handleShare } = useShare();

  // 다국어 라벨
  const t = useTranslations('Menu.Sermon');
  const typeColorMap: Record<number, string> = {
    0: 'text-blue-600 dark:text-blue-400',
    1: 'text-green-600 dark:text-green-400',
    2: 'text-purple-600 dark:text-purple-400',
  };
  const gradientMap: Record<number, string> = {
    0: 'bg-gradient-to-b from-blue-200/30 to-blue-100/10 dark:from-blue-500/20 dark:to-blue-400/10',
    1: 'bg-gradient-to-b from-green-200/30 to-green-100/10 dark:from-green-500/20 dark:to-green-400/10',
    2: 'bg-gradient-to-b from-purple-200/30 to-purple-100/10 dark:from-purple-500/20 dark:to-purple-400/10',
  };
  const typeLabel =
    sermonType === SOUL_TYPE.INTRODUCE
      ? t('introduce')
      : sermonType === SOUL_TYPE.MISSION
        ? t('mission')
        : sermonType === SOUL_TYPE.SPIRIT
          ? t('spirit')
          : '';

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
          <div className="absolute right-10 top-4 z-20">
            <Share2 className="size-4 cursor-pointer" onClick={() => handleShare(id, name, desc ?? '', customUrl)} />
          </div>
          <DialogClose className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 cursor-pointer" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className={cn('relative overflow-hidden', gradientMap[sermonType ?? 0])}>
            <BorderBeam className="opacity-20" />
            <motion.div
              className="relative z-10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DialogTitle asChild>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
                  {typeLabel && (
                    <div className={cn('text-xs mb-2', typeColorMap[sermonType ?? 0])}>
                      {typeLabel}
                    </div>
                  )}
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
                    <div className="text-base leading-relaxed whitespace-pre-wrap ">{desc}</div>
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
