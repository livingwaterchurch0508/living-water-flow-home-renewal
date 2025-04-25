import { useTranslations } from 'next-intl';
import { ContentCard } from './ContentCard';
import { TitleText, SubtitleText, BodyText } from './StyledText';

export function WorshipContent() {
  const t = useTranslations('Introduce');

  return (
    <ContentCard>
      <TitleText text={t('worship.name')} className="mb-8" />
      <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
        <BodyText text={t('worship.details')} />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <SubtitleText text={t('worship.sunday')} />
          <BodyText text={t('worship.sunWorship')} />
        </div>
        <div className="space-y-4">
          <SubtitleText text={t('worship.wednesday')} />
          <BodyText text={t('worship.wedWorship')} />
        </div>
      </div>
    </ContentCard>
  );
}
