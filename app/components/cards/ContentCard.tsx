'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { Play, XIcon, Share2 } from 'lucide-react';

import { useShare } from '@/app/hooks/use-share';
import { cn } from '@/app/lib/utils';
import { getRelativeTime } from '@/app/lib/date';
import { YOUTUBE_URL } from '@/app/variables/constants';

interface ContentCardProps {
  type: 'hymn' | 'sermon';
  name: string;
  desc: string;
  url: string;
  createdAt: string;
  className?: string;
  variant?: 'home' | 'page';
  autoOpen?: boolean;
  onDialogClose?: () => void;
  id?: string;
  customUrl?: string;
}

export function ContentCard({
  type,
  name,
  desc,
  url,
  createdAt,
  className,
  variant = 'page',
  autoOpen = false,
  onDialogClose,
  id,
  customUrl,
}: ContentCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { locale } = useParams();
  const videoSrc = `${YOUTUBE_URL.EMBED}${url}`;
  const thumbnailSrc = `${YOUTUBE_URL.THUMB_NAIL}${url}/mqdefault.jpg`;
  const relativeTime = getRelativeTime(createdAt, locale as string);
  const { handleShare } = useShare();

  useEffect(() => {
    if (autoOpen) {
      setIsVideoOpen(true);
    }
  }, [autoOpen]);

  const handleClose = () => {
    setIsVideoOpen(false);
    onDialogClose?.();
  };


  return (
    <>
      <div className={cn('relative',  'w-full', className)}>
        <div
          data-testid="content-card"
          className="group/card relative cursor-pointer"
          onClick={() => setIsVideoOpen(true)}
        >
          <div
            className={cn(
              'group relative overflow-hidden rounded-lg bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900',
              'shadow-md hover:shadow-2xl transition-all duration-200',
              'p-0'
            )}
          >
            <div className={cn('relative w-full aspect-video')}
            >
              <Image
                src={thumbnailSrc}
                alt={name}
                fill
                className="object-cover transition-all duration-200 group-hover:scale-105"
                sizes={
                  variant === 'home'
                    ? '300px'
                    : '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                }
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute top-4 left-4 right-4 z-10">
                <h3
                  className="text-base sm:text-lg font-semibold text-white line-clamp-2 mb-1"
                  data-testid={`content-card-title-${type}`}
                >
                  {name}
                </h3>
                <p
                  className="text-xs sm:text-sm text-neutral-200 line-clamp-3 mb-2"
                  data-testid={`content-card-desc-${type}`}
                >
                  {desc}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 text-xs text-neutral-300">
                <span>{relativeTime}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex size-12 sm:size-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md transition-transform duration-200 ease-out group-hover:scale-110">
                  <div className="flex size-8 sm:size-12 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary shadow-md">
                    <Play
                      className="size-4 sm:size-6 fill-white text-white"
                      style={{
                        filter:
                          'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isVideoOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              data-testid="content-card-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleClose}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full aspect-video max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                  <motion.button
                    data-testid="content-card-share-button"
                    className="rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                    onClick={() => handleShare(id, name, desc, customUrl)}
                  >
                    <Share2 className="size-5" />
                  </motion.button>
                  <motion.button
                    data-testid="content-card-close-button"
                    className="rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                    onClick={handleClose}
                  >
                    <XIcon className="size-5" />
                  </motion.button>
                </div>
                <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
                  <iframe
                    src={videoSrc}
                    className="size-full rounded-2xl"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
