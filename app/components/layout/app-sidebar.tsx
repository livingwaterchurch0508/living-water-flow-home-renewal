'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/app/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/app/components/ui/collapsible';
import Youtube from '@/app/components/icon/Youtube';

import { cn } from '@/app/lib/utils';
import { Menus, ROUTER_PATHS, YOUTUBE_URL } from '@/app/variables/constants';
import { MENU_TAB } from '@/app/variables/enums';

export function AppSidebar() {
  const t = useTranslations('Menu');
  const router = useRouter();
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // 초기 상태 설정: isActive가 true인 그룹들을 열린 상태로 설정
    const initialOpenGroups = Menus().reduce(
      (acc, group) => {
        acc[group.name] = group.isActive;
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    setOpenGroups(initialOpenGroups);
  }, []);

  const isActive = (path: string) => {
    const currentPath = pathname.split('/').slice(2).join('/');
    const comparePath = path.startsWith('/') ? path.slice(1) : path;
    return currentPath.split('?')[0] === comparePath;
  };

  const getIconColor = (path: string) => {
    if (!isActive(path)) return 'text-muted-foreground';

    switch (path) {
      case '/':
        return 'text-blue-500';
      case `${ROUTER_PATHS[MENU_TAB.INTRODUCE]}`:
        return 'text-indigo-500';
      case `${ROUTER_PATHS[MENU_TAB.SERMON]}`:
        return 'text-blue-500';
      case `${ROUTER_PATHS[MENU_TAB.HYMN]}`:
        return 'text-rose-500';
      case `${ROUTER_PATHS[MENU_TAB.NEWS]}`:
        return 'text-emerald-500';
      case `${ROUTER_PATHS[MENU_TAB.INFO]}`:
        return 'text-violet-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleIconClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    router.push(`/${path}?type=0`);
  };

  const handleGroupToggle = (groupName: string, open: boolean) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: open }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('name')} asChild>
              <Link href="/public">
                <HomeIcon className={cn('h-4 w-4', getIconColor('/'))} />
                <span className={cn(getIconColor('/'))}>{t('name')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {Menus().map((group) => (
              <Collapsible
                key={group.name}
                asChild
                defaultOpen={group.isActive}
                onOpenChange={(open) => handleGroupToggle(group.name, open)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t(group.name)} asChild={group.items.length > 0}>
                      <div className="flex items-center w-full">
                        {group.icon && (
                          <div
                            onClick={(e) => handleIconClick(e, group.path)}
                            className="cursor-pointer"
                          >
                            <group.icon className={cn('h-4 w-4', getIconColor(group.path))} />
                          </div>
                        )}
                        <span className={cn('ml-2', getIconColor(group.path))}>
                          {t(group.name)}
                        </span>
                        {group.items.length > 0 && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <AnimatePresence initial={false}>
                      {openGroups[group.name] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <SidebarMenuSub>
                            {group.items.map((item) => (
                              <SidebarMenuSubItem key={item.name}>
                                <SidebarMenuSubButton asChild>
                                  <Link
                                    href={`/${ROUTER_PATHS[item.menuTab]}?type=${item.detailTab}`}
                                  >
                                    {t(item.name)}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('youtube')} asChild>
              <Link href={YOUTUBE_URL.CHANNEL} target="_blank" rel="noopener noreferrer">
                <Youtube className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors duration-200" />
                <span>{t('youtube')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
