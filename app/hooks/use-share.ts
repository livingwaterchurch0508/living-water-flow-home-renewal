import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useShare() {
  const t = useTranslations('Common');

  /**
   * @param idOrUrl - id 또는 url
   * @param name - 공유할 이름
   * @param desc - 공유할 설명
   * @param customUrl - (선택) 직접 지정할 공유 URL
   */
  const handleShare = (
    idOrUrl: string | number | undefined,
    name: string,
    desc: string,
    customUrl?: string
  ) => {
    if ((!idOrUrl && !customUrl) || typeof window === 'undefined') return;
    let shareUrl: string;
    if (customUrl) {
      // 직접 지정한 URL 사용
      shareUrl = customUrl;
    } else {
      // 기존 id 기반 URL 생성
      const url = new URL(window.location.href);
      url.searchParams.set('id', idOrUrl!.toString());
      shareUrl = url.toString();
    }
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
