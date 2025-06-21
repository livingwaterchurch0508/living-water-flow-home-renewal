import { useTranslations } from 'next-intl';

import { ContentCard } from './ContentCard';
import { TitleText, BodyText } from './StyledText';

export function ChurchContent() {
  const t = useTranslations('Introduce');

  return (
    <ContentCard reverse>
      <TitleText text={t('church.name')} className="mb-8" />
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <BodyText text={t('church.content')} />
      </div>
    </ContentCard>
  );
}
