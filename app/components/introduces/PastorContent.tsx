import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { ContentCard } from './ContentCard';
import { TitleText, SubtitleText, BodyText } from './StyledText';

export function PastorContent() {
  const t = useTranslations('Introduce');

  return (
    <ContentCard>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
          <Image
            src="/pastor.jpeg"
            alt={t('pastor.name')}
            className="object-cover w-full h-full"
            fill
          />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <TitleText text={t('pastor.name')} />
          <SubtitleText text={t('pastor.overview')} />
          <BodyText text={t('pastor.details')} />
        </div>
      </div>
    </ContentCard>
  );
}
