import { DateTime } from 'luxon';

export function getRelativeTime(dateStr: string, locale: string = 'ko') {
  const now = DateTime.now().setLocale(locale);
  const date = DateTime.fromISO(dateStr).setLocale(locale);
  const diff = now.diff(date, ['years', 'months', 'weeks', 'days', 'hours', 'minutes']).toObject();

  const t = (key: string) => {
    if (locale === 'en') {
      return {
        'time.years': 'years ago',
        'time.months': 'months ago',
        'time.weeks': 'weeks ago',
        'time.days': 'days ago',
        'time.hours': 'hours ago',
        'time.minutes': 'minutes ago',
        'time.just_now': 'just now',
      }[key];
    }
    return {
      'time.years': '년 전',
      'time.months': '개월 전',
      'time.weeks': '주 전',
      'time.days': '일 전',
      'time.hours': '시간 전',
      'time.minutes': '분 전',
      'time.just_now': '방금 전',
    }[key];
  };

  if (diff.years && diff.years > 0) return `${Math.floor(diff.years)}${t('time.years')}`;
  if (diff.months && diff.months > 0) return `${Math.floor(diff.months)}${t('time.months')}`;
  if (diff.weeks && diff.weeks > 0) return `${Math.floor(diff.weeks)}${t('time.weeks')}`;
  if (diff.days && diff.days > 0) return `${Math.floor(diff.days)}${t('time.days')}`;
  if (diff.hours && diff.hours > 0) return `${Math.floor(diff.hours)}${t('time.hours')}`;
  if (diff.minutes && diff.minutes > 0) return `${Math.floor(diff.minutes)}${t('time.minutes')}`;
  return t('time.just_now');
}
