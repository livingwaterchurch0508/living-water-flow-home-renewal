'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import ImageGalleryDialog from '@/components/magicui/image-gallery-dialog';

import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/lib/date';

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
  id: string;
  customUrl?: string;
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
  id,
  customUrl,
}: CommunityCardProps) {
  const { locale } = useParams();
  const relativeTime = getRelativeTime(createdAt, locale as string);

  // caption 수만큼 이미지 배열 생성
  const images = Array.from({ length: caption }, (_, i) => ({
    src: `/api/image?imageName=${url}${i + 1}.jpg`,
    alt: `${name} - 이미지 ${i + 1}`,
  }));

  return (
    <div className={cn('relative',  'w-full', className)}>
      <ImageGalleryDialog
        images={images}
        thumbnailIndex={0}
        title={name}
        desc={desc}
        onClose={onDialogClose}
        autoOpen={autoOpen}
        id={id}
        customUrl={customUrl}
      >
        <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-200 p-0">
          <div className={cn('relative w-full aspect-video')}
          >
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
            <div className="absolute top-4 left-4 right-4 z-10">
              <h3 data-testid="community-card-title" className="text-base sm:text-lg font-semibold text-white line-clamp-2 mb-1">
                {name}
              </h3>
              <p data-testid="community-card-desc" className="text-xs sm:text-sm text-neutral-200 line-clamp-3 mb-2">{desc}</p>
            </div>
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 text-xs text-neutral-300">
              <span>{relativeTime}</span>
            </div>
          </div>
        </div>
      </ImageGalleryDialog>
    </div>
  );
}
