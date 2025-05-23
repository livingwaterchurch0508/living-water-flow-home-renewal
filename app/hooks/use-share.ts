import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useShare() {
  const t = useTranslations('Common');

  const handleShare = (id: string | number | undefined, name: string, desc: string) => {
    if (!id || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('id', id.toString());
    const shareUrl = url.toString();
    const shareData = {
      title: document.title,
      text: `${name}\n\n${desc}\n\n${t('shareText')}`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // 사용자가 취소한 경우 등은 무시
      });
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.success(t('copy'));
        })
        .catch(() => {});
    }
  };

  return { handleShare };
}
