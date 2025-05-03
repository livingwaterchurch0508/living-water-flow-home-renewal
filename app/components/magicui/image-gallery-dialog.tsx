'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { ChevronLeft, ChevronRight, XIcon, ImageIcon, Maximize2 } from 'lucide-react';

import { cn } from '@/app/lib/utils';

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
  onClose?: () => void;
  autoOpen?: boolean;
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
  onClose,
  autoOpen = false,
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(thumbnailIndex);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const t = useTranslations('Common');

  const controls = useAnimation();
  const x = useMotionValue(0);
  const input = [-200, 0, 200];
  const opacity = useTransform(x, input, [0, 1, 0]);

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex]);

  const handleClose = () => {
    setIsImageLoaded(false);
    setIsOpen(false);
    onClose?.();
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -100 || velocity < -500) {
      await controls.start({ x: -200, opacity: 0 });
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (offset > 100 || velocity > 500) {
      await controls.start({ x: 200, opacity: 0 });
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handlePrevious = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({ x: 200, opacity: 0 });
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    controls.start({ x: 0, opacity: 1 });
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({ x: -200, opacity: 0 });
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    controls.start({ x: 0, opacity: 1 });
  };

  return (
    <div className={cn('relative', className)}>
      <div
        data-testid="community-card"
        className="group relative cursor-pointer overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {children || (
          <>
            <div className="relative h-48 w-full overflow-hidden md:h-64">
              <Image
                src={`${images[thumbnailIndex].src}&size=thumbnail`}
                alt={images[thumbnailIndex].alt || 'Gallery thumbnail'}
                className="transition-all duration-200 ease-out group-hover:scale-105 group-hover:brightness-90"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
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
              onClick={handleClose}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                {...animationVariants[animationStyle]}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative mx-4 w-full max-w-3xl md:mx-0"
              >
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                  <PhotoProvider
                    loop
                    speed={() => 300}
                    easing={(type) =>
                      type === 2
                        ? 'cubic-bezier(0.36, 0, 0.66, -0.56)'
                        : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }
                    onIndexChange={setCurrentIndex}
                  >
                    {images.map((img, idx) => (
                      <PhotoView key={idx} src={`${img.src}&size=original`}>
                        <div style={{ display: idx === currentIndex ? 'block' : 'none' }}>
                          <motion.button className="rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black">
                            <Maximize2 className="size-5" />
                          </motion.button>
                        </div>
                      </PhotoView>
                    ))}
                  </PhotoProvider>
                  <motion.button
                    data-testid="community-card-close-button"
                    onClick={handleClose}
                    className="rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                  >
                    <XIcon className="size-5" />
                  </motion.button>
                </div>

                <div className="relative isolate z-[1] overflow-hidden rounded-2xl border-2 border-white bg-black">
                  {title && (
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      className="relative aspect-video w-full touch-pan-y"
                      initial={{ opacity: 0, x: 0 }}
                      animate={controls}
                      style={{ x, opacity }}
                      onDragEnd={images.length > 1 ? handleDragEnd : undefined}
                      transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                    >
                      <Image
                        data-testid="community-card-image"
                        src={`${images[currentIndex].src}&size=medium`}
                        alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
                        className={cn(
                          'object-contain transition-opacity duration-200',
                          isImageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        draggable={false}
                        onLoad={handleImageLoad}
                      />
                      {!isImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  {images.length > 1 && (
                    <>
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
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
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
                        <div className="relative size-14">
                          <Image
                            src={`${image.src}&size=thumbnail`}
                            alt={image.alt || `Thumbnail ${index + 1}`}
                            className="object-cover"
                            fill
                            sizes="56px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
