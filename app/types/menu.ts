import { LucideIcon } from 'lucide-react';
import { MENU_TAB } from '@/app/variables/enums';

export interface MenuItem {
  name: string;
  menuTab: MENU_TAB;
  detailTab: number;
}

export interface MenuGroup {
  name: string;
  icon: LucideIcon;
  isActive: boolean;
  items: MenuItem[];
  menuTab?: MENU_TAB;
}

export type MenuGroups = MenuGroup[];
