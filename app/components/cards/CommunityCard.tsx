'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import ImageGalleryDialog from '@/app/components/magicui/image-gallery-dialog';

import { cn } from '@/app/lib/utils';
import { getRelativeTime } from '@/app/lib/date';

interface CommunityCardProps {
  name: string;
  desc: string;
  url: string;
  createdAt: string;
  className?: string;
  caption?: number;
  variant?: 'home' | 'page';
  onDialogClose?: () => void;
  autoOpen?: boolean;
}

export function CommunityCard({
  name,
  desc,
  url,
  createdAt,
  className,
  caption = 1,
  variant = 'page',
  onDialogClose,
  autoOpen = false,
}: CommunityCardProps) {
  const { locale } = useParams();
  const relativeTime = getRelativeTime(createdAt, locale as string);

  // caption 수만큼 이미지 배열 생성
  const images = Array.from({ length: caption }, (_, i) => ({
    src: `/api/image?imageName=${url}${i + 1}.jpg`,
    alt: `${name} - 이미지 ${i + 1}`,
  }));

  return (
    <div className={cn('relative', variant === 'home' ? 'w-[300px]' : 'w-full', className)}>
      <ImageGalleryDialog
        images={images}
        thumbnailIndex={0}
        title={name}
        onClose={onDialogClose}
        autoOpen={autoOpen}
      >
        <div className="group relative overflow-hidden rounded-lg">
          <div className={cn('relative aspect-video', variant === 'home' ? 'w-[300px]' : 'w-full')}>
            <Image
              src={`${images[0].src}&size=small`}
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
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-200 group-hover:bg-black/50" />
            <div className="absolute inset-0 p-4 sm:p-6">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex-1 space-y-2">
                  <h3 data-testid="community-card-title" className="text-base sm:text-lg font-semibold text-white line-clamp-2">
                    {name}
                  </h3>
                  <p data-testid="community-card-desc" className="text-xs sm:text-sm text-neutral-200 line-clamp-3">{desc}</p>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-neutral-300">
                  <span>{relativeTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ImageGalleryDialog>
    </div>
  );
}
