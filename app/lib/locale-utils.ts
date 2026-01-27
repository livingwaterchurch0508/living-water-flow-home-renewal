/**
 * 다국어 콘텐츠 변환 유틸리티
 * 여러 컴포넌트에서 중복되는 locale 기반 텍스트 선택 로직을 통합
 */

type LocalizedContent = {
  name?: string | null;
  nameEn?: string | null;
  desc?: string | null;
  descEn?: string | null;
};

/**
 * locale에 따라 적절한 텍스트를 반환
 * @param locale - 현재 로케일 ('ko' | 'en')
 * @param primary - 기본 텍스트 (한국어)
 * @param english - 영어 텍스트
 * @returns 선택된 텍스트
 */
export function getLocalizedText(
  locale: string,
  primary: string | null | undefined,
  english: string | null | undefined
): string {
  if (locale === 'en') {
    return english || primary || '';
  }
  return primary || '';
}

/**
 * 콘텐츠 객체의 name과 desc를 locale에 맞게 변환
 * @param item - 변환할 콘텐츠 객체
 * @param locale - 현재 로케일
 * @returns name과 desc가 locale에 맞게 변환된 객체
 */
export function localizeContent<T extends LocalizedContent>(
  item: T,
  locale: string
): T & { name: string; desc: string } {
  return {
    ...item,
    name: getLocalizedText(locale, item.name, item.nameEn),
    desc: getLocalizedText(locale, item.desc, item.descEn),
  };
}

/**
 * 콘텐츠 배열을 locale에 맞게 일괄 변환
 * @param items - 변환할 콘텐츠 배열
 * @param locale - 현재 로케일
 * @returns locale에 맞게 변환된 배열
 */
export function localizeContentList<T extends LocalizedContent>(
  items: T[],
  locale: string
): (T & { name: string; desc: string })[] {
  return items.map((item) => localizeContent(item, locale));
}
