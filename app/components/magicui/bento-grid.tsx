import { ArrowRightIcon } from '@radix-ui/react-icons';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ElementType;
  description: string;
  href: string;
  cta: string;
  index?: number;
}

type ContentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid w-full gap-4',
        'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
        'auto-rows-[minmax(8rem,auto)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const getContentSize = (name: string, description: string): ContentSize => {
  const nameLength = name?.length || 0;
  const descLength = description?.length || 0;

  // 제목이 긴 경우 더 큰 가중치 부여
  const weightedLength = nameLength * 1.5 + descLength;

  if (weightedLength > 300) return 'xl';
  if (weightedLength > 200) return 'lg';
  if (weightedLength > 100) return 'md';
  if (weightedLength > 50) return 'sm';
  return 'xs';
};

const getGridClasses = (size: ContentSize, index: number): string => {
  // 기본 레이아웃 패턴
  const patterns = {
    xl: [
      'col-span-2 row-span-2 md:col-start-1 md:col-end-5 md:row-span-2', // 첫 번째 xl 아이템
      'col-span-2 row-span-2 md:col-start-1 md:col-end-3 md:row-span-2', // 두 번째 xl 아이템
      'col-span-2 row-span-2 md:col-start-3 md:col-end-5 md:row-span-2', // 세 번째 xl 아이템
    ],
    lg: [
      'col-span-2 row-span-2 md:col-start-1 md:col-end-3 md:row-span-2',
      'col-span-2 row-span-1 md:col-start-3 md:col-end-5 md:row-span-1',
      'col-span-2 row-span-1 md:col-start-1 md:col-end-3 md:row-span-1',
    ],
    md: [
      'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
      'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
      'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
    ],
    sm: [
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    ],
    xs: [
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
      'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    ],
  };

  // 패턴 순환
  const patternIndex = Math.floor(index / 3) % 3;
  return patterns[size][patternIndex];
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  index = 0,
  ...props
}: BentoCardProps) => {
  const contentSize = getContentSize(name, description);
  const gridClass = getGridClasses(contentSize, index);

  return (
    <div
      key={name}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl p-6',
        // light styles
        'bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
        gridClass,
        className
      )}
      {...props}
    >
      <div>{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2">
        {Icon && (
          <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300" />
        )}
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">{name}</h3>
        <p className="max-w-lg whitespace-pre-line text-neutral-400">{description}</p>
      </div>

      <div
        className={cn(
          'pointer-events-none mt-4 flex w-full transform-gpu flex-row items-center opacity-0 transition-all duration-300 group-hover:opacity-100'
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  );
};

export { BentoCard, BentoGrid };
