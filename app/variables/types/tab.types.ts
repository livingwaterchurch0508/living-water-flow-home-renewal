import type {
  HYMN_TAB,
  INFO_TAB,
  INTRODUCE_TAB,
  MENU_TAB,
  NEWS_TYPES,
  SERMON_TAB,
} from '@/variables/enums';

export interface IMoveTab {
  menuTab: MENU_TAB;
  detailTab?: INTRODUCE_TAB | SERMON_TAB | HYMN_TAB | NEWS_TYPES | INFO_TAB;
}
