export enum API_ROUTES {
  GET_HYMNS,
  GET_HYMN_BY_ID,
  GET_SERMONS,
  GET_SERMON_BY_ID,
  GET_COMMUNITIES,
  GET_COMMUNITY_BY_ID,
}

export enum LOCALE_TYPE {
  KO = 'ko',
  EN = 'en',
}

/**
 * 0: 교회사역
 * 1: 교회행사
 * 2: 성도이야기
 * 3: 모두
 */
export enum NEWS_TYPES {
  SERVICE,
  EVENT,
  STORY,
  ALL,
}

/**
 * 0: 소개
 * 1: 설교
 * 2: 찬양
 * 3: 소식
 * 4: 안내
 */
export enum MENU_TAB {
  INTRODUCE,
  SERMON,
  HYMN,
  NEWS,
  INFO,
}

/**
 * 0: 담임 목사
 * 1: 교회 소개
 * 2: 주일 예배
 */
export enum INTRODUCE_TAB {
  PASTOR ,
  CHURCH ,
  WORSHIP,
}

/**
 * 0: 설교 영상
 * 1: 영의 말씀
 */
export enum SERMON_TAB {
  RHEMA,
  SOUL,
}

/**
 * 0: 찬양 영상
 * 1: 영혼의 찬양
 */
export enum HYMN_TAB {
  HYMN,
  SONG,
}

/**
 * 0: 교회 사역
 * 1: 교회 행사
 * 2: 성도 이야기
 */
export enum NEWS_TAB {
  NEWS,
  EVENT,
  STORY,
}

/**
 * 0: 교회 위치/주차
 * 1: 오시는 길
 */
export enum INFO_TAB {
  LOCATION,
}

/**
 * 0: 교회 비전
 * 1: 영적 삶의 원리와 작용
 * 2: 지혜로운 자의 삶
 */
export enum SOUL_TYPE {
  INTRODUCE,
  MISSION,
  SPIRIT,
}
