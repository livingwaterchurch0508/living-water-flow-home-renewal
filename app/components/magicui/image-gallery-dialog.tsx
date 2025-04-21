'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, XIcon, ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/app/lib/utils';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
  }>;
  thumbnailIndex?: number;
  animationStyle?: keyof typeof animationVariants;
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

const animationVariants = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'slide-right': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  'slide-left': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export default function ImageGalleryDialog({
  images,
  thumbnailIndex = 0,
  animationStyle = 'from-center',
  className,
  children,
  title,
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(thumbnailIndex);
  const t = useTranslations('Common');

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className="group relative cursor-pointer overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {children || (
          <>
            <Image
              src={images[thumbnailIndex].src}
              alt={images[thumbnailIndex].alt || 'Gallery thumbnail'}
              className="w-full transition-all duration-200 ease-out group-hover:scale-105 group-hover:brightness-90"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <ImageIcon className="size-4" />
                <span>{t('imageCount', { count: images.length })}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                {...animationVariants[animationStyle]}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative mx-4 w-full max-w-3xl md:mx-0"
              >
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-12 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                >
                  <XIcon className="size-5" />
                </motion.button>

                <div className="relative isolate z-[1] overflow-hidden rounded-2xl border-2 border-white bg-black">
                  {title && (
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentIndex}
                      src={images[currentIndex].src}
                      alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mx-auto max-h-[60vh] w-auto object-contain"
                    />
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <ChevronRight className="size-5" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                    {currentIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl bg-white/10 p-2 backdrop-blur-md">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={cn(
                        'relative flex-shrink-0 overflow-hidden rounded-md transition-all',
                        currentIndex === index
                          ? 'ring-2 ring-white'
                          : 'opacity-60 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || `Thumbnail ${index + 1}`}
                        className="size-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
