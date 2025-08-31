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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Youtube } from '@/components/icon/Youtube';

import { cn } from '@/lib/utils';
import { Menus, ROUTER_PATHS, YOUTUBE_URL } from '@/variables/constants';
import { MENU_TAB } from '@/variables/enums';

export function AppSidebar() {
  const t = useTranslations('Menu');
  const router = useRouter();
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
  const { setOpenMobile } = useSidebar();

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
        return 'text-violet-500';
      case `${ROUTER_PATHS[MENU_TAB.INTRODUCE]}`:
        return 'text-indigo-500';
      case `${ROUTER_PATHS[MENU_TAB.SERMON]}`:
        return 'text-blue-500';
      case `${ROUTER_PATHS[MENU_TAB.HYMN]}`:
        return 'text-rose-500';
      case `${ROUTER_PATHS[MENU_TAB.NEWS]}`:
        return 'text-emerald-500';
      case `${ROUTER_PATHS[MENU_TAB.INFO]}`:
        return 'text-cyan-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleMenuClick = (path: string, detailTab?: number) => {
    if (detailTab !== undefined) {
      router.push(`/${path}?type=${detailTab}`);
    } else {
      router.push(`/${path}?type=0`);
    }
    setOpenMobile(false); // 모바일에서 메뉴 클릭 시 사이드바 닫기
  };

  const handleIconClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    handleMenuClick(path);
  };

  const handleGroupToggle = (groupName: string, open: boolean) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: open }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 border-b border-slate-200/30 dark:border-slate-700/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={t('name')} 
              asChild
              className="group relative overflow-hidden rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/60 dark:hover:border-slate-500/60 justify-start data-[collapsed=true]:p-2"
            >
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <HomeIcon className={cn('h-4 w-4', getIconColor('/'))} />
                <span className={cn('font-semibold', getIconColor('/'))}>{t('name')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent >
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {Menus().map((group, index) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Collapsible
                  asChild
                  defaultOpen={group.isActive}
                  onOpenChange={(open) => handleGroupToggle(group.name, open)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={t(group.name)} 
                        asChild={group.items.length > 0}
                        className="group relative overflow-hidden rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/60 dark:hover:border-slate-500/60 justify-start data-[collapsed=true]:p-2"
                      >
                        <div
                          className="flex items-center w-full"
                          onClick={() => {
                            if (group.items.length === 0) {
                              handleMenuClick(group.path);
                            }
                          }}
                        >
                          {group.icon && (
                            <div
                              onClick={(e) => handleIconClick(e, group.path)}
                              className="cursor-pointer"
                            >
                              <group.icon className={cn('h-4 w-4', getIconColor(group.path))} />
                            </div>
                          )}
                          <span className={cn('ml-2 font-medium', getIconColor(group.path))}>
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
                            className="mt-2 ml-4 space-y-1"
                          >
                            <SidebarMenuSub>
                              {group.items.map((item, itemIndex) => (
                                <motion.div
                                  key={item.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIndex * 0.05, duration: 0.2 }}
                                >
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      asChild
                                      className="group relative overflow-hidden rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200 hover:shadow-sm border border-slate-200/30 dark:border-slate-600/30 hover:border-slate-300/40 dark:hover:border-slate-500/40"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleMenuClick(ROUTER_PATHS[item.menuTab], item.detailTab);
                                      }}
                                    >
                                      <Link
                                        href={`/${ROUTER_PATHS[item.menuTab]}?type=${item.detailTab}`}
                                      >
                                        <span>{t(item.name)}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </motion.div>
                              ))}
                            </SidebarMenuSub>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </motion.div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-slate-200/30 dark:border-slate-700/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={t('youtube')} 
              asChild
              className="group relative overflow-hidden rounded-xl hover:bg-red-50/60 dark:hover:bg-red-900/30 transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50 hover:border-red-300/60 dark:hover:border-red-600/60 justify-start data-[collapsed=true]:p-2"
            >
              <Link
                href={YOUTUBE_URL.CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenMobile(false)}
              >
                <Youtube className="h-4 w-4 text-red-500 hover:text-red-600 transition-colors duration-200" />
                <span className="font-medium text-red-600 dark:text-red-400">{t('youtube')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
