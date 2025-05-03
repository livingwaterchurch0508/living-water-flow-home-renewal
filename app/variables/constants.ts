import { Church, BookOpen, Music, Newspaper, MapPin } from 'lucide-react';
import {
  HYMN_TAB,
  INFO_TAB,
  INTRODUCE_TAB,
  MENU_TAB,
  NEWS_TAB,
  SERMON_TAB,
  SOUL_TYPE,
} from '@/app/variables/enums';

export const ROUTER_PATHS = {
  [MENU_TAB.INTRODUCE]: 'introduces',
  [MENU_TAB.SERMON]: 'sermons',
  [MENU_TAB.HYMN]: 'hymns',
  [MENU_TAB.NEWS]: 'news',
  [MENU_TAB.INFO]: 'infos',
} as const;

export const YOUTUBE_URL = {
  THUMB_NAIL: 'https://img.youtube.com/vi/',
  EMBED: 'https://www.youtube.com/embed/',
  CHANNEL: 'https://www.youtube.com/@livingwaterflowingchurch482',
  VIEW: 'https://www.youtube.com/watch?v=',
};

export const SOUL_CATEGORY = {
  [SOUL_TYPE.INTRODUCE]: 'introduce',
  [SOUL_TYPE.MISSION]: 'mission',
  [SOUL_TYPE.SPIRIT]: 'spirit',
} as const;

export const Menus = () => [
  {
    name: 'Introduce.name',
    path: ROUTER_PATHS[MENU_TAB.INTRODUCE],
    icon: Church,
    isActive: true,
    items: [
      {
        name: 'Introduce.pastor',
        menuTab: MENU_TAB.INTRODUCE,
        detailTab: INTRODUCE_TAB.PASTOR,
      },
      {
        name: 'Introduce.introduce',
        menuTab: MENU_TAB.INTRODUCE,
        detailTab: INTRODUCE_TAB.CHURCH,
      },
      {
        name: 'Introduce.worship',
        menuTab: MENU_TAB.INTRODUCE,
        detailTab: INTRODUCE_TAB.WORSHIP,
      },
    ],
  },
  {
    name: 'Sermon.name',
    icon: BookOpen,
    isActive: true,
    path: ROUTER_PATHS[MENU_TAB.SERMON],
    items: [
      {
        name: 'Sermon.sermon',
        menuTab: MENU_TAB.SERMON,
        detailTab: SERMON_TAB.RHEMA,
      },
      {
        name: 'Sermon.soul',
        menuTab: MENU_TAB.SERMON,
        detailTab: SERMON_TAB.SOUL,
      },
    ],
  },
  {
    name: 'Hymn.name',
    icon: Music,
    isActive: true,
    path: ROUTER_PATHS[MENU_TAB.HYMN],
    items: [
      {
        name: 'Hymn.hymn',
        menuTab: MENU_TAB.HYMN,
        detailTab: HYMN_TAB.HYMN,
      },
      {
        name: 'Hymn.song',
        menuTab: MENU_TAB.HYMN,
        detailTab: HYMN_TAB.SONG,
      },
    ],
  },
  {
    name: 'News.name',
    icon: Newspaper,
    isActive: true,
    path: ROUTER_PATHS[MENU_TAB.NEWS],
    items: [
      {
        name: 'News.service',
        menuTab: MENU_TAB.NEWS,
        detailTab: NEWS_TAB.NEWS,
      },
      {
        name: 'News.event',
        menuTab: MENU_TAB.NEWS,
        detailTab: NEWS_TAB.EVENT,
      },
      {
        name: 'News.story',
        menuTab: MENU_TAB.NEWS,
        detailTab: NEWS_TAB.STORY,
      },
    ],
  },
  {
    name: 'Info.name',
    icon: MapPin,
    isActive: true,
    path: ROUTER_PATHS[MENU_TAB.INFO],
    items: [
      {
        name: 'Info.place',
        menuTab: MENU_TAB.INFO,
        detailTab: INFO_TAB.LOCATION,
      },
    ],
  },
];

export const SECTION_WIDTH = {
  EXPANDED: 'w-full md:w-[calc(100vw-291px)]',
  COLLAPSED: 'w-full md:w-[calc(100vw-83px)]',
} as const;

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `https://${process.env.NEXT_PUBLIC_BASE_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
