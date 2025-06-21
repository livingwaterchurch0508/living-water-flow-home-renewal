'use client';
import { useTranslations } from 'next-intl';
import { TextReveal } from '@/app/components/magicui/text-reveal';
import { BorderBeam } from '@/app/components/magicui/border-beam';
import UploadDialog from './UploadDialog';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/app/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import { ContentListSkeleton } from '@/app/components/ui/content-list-skeleton';
import type { ISermon, IHymn, ICommunity } from '@/app/variables/interfaces';
import { cn } from '@/app/lib/utils';
import { SECTION_WIDTH } from '@/app/variables/constants';
import { useSidebar } from '@/app/components/ui';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import type { FileItem } from './UploadDialog';

// Sermon, Hymn, News row types
interface SermonRow {
  id: number;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  date: string;
  type: number;
  url: string;
  soulType?: number;
}
interface HymnRow {
  id: number;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  date: string;
  type: number;
  url: string;
}
interface NewsRow {
  id: number;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  date: string;
  type: number;
}

type TabType = 'sermon' | 'hymn' | 'news';

async function fetchAllTypePages<T>(
  fetcher: (args: {
    page: number;
    limit: number;
    type: number;
  }) => Promise<{ status: string; payload?: { items: unknown[] } }>,
  types: number[]
): Promise<T[]> {
  const promises: Promise<{ status: string; payload?: { items: unknown[] } }>[] = [];
  for (const type of types) {
    promises.push(fetcher({ page: 1, limit: 1000, type }));
  }
  const results = await Promise.all(promises);
  return results
    .filter((res) => res && res.status === 'success' && res.payload)
    .flatMap((res) =>
      res.payload!.items.map((item) => {
        if (typeof item === 'object' && item !== null) {
          if ('viewCount' in item && (item as Record<string, unknown>).viewCount === undefined)
            (item as Record<string, unknown>).viewCount = null;
          if ('files' in item && (item as Record<string, unknown>).files === undefined)
            (item as Record<string, unknown>).files = [];
        }
        return item as T;
      })
    );
}

export default function DashboardUI() {
  const t = useTranslations('Admin');
  const menuT = useTranslations('Menu');
  const { state } = useSidebar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedTab, setSelectedTab] = useState<TabType>('sermon');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [allData, setAllData] = useState<{ sermon: ISermon[]; hymn: IHymn[]; news: ICommunity[] }>({
    sermon: [],
    hymn: [],
    news: [],
  });
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isErrorAll, setIsErrorAll] = useState(false);
  const [errorMsgAll, setErrorMsgAll] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // fetchAll을 useCallback으로 선언하여 handleSubmit에서 참조 가능하게 함
  const fetchAll = useCallback(async () => {
    setIsLoadingAll(true);
    setIsErrorAll(false);
    setErrorMsgAll('');
    try {
      const [sermonMod, hymnMod, commMod] = await Promise.all([
        import('@/app/hooks/use-sermons'),
        import('@/app/hooks/use-hymns'),
        import('@/app/hooks/use-communities'),
      ]);
      const [sermon, hymn, news] = await Promise.all([
        fetchAllTypePages<ISermon>(sermonMod.fetchSermons, [0, 1]),
        fetchAllTypePages<IHymn>(hymnMod.fetchHymns, [0, 1]),
        fetchAllTypePages<ICommunity>(commMod.fetchCommunities, [0, 1, 2]),
      ]);
      setAllData({ sermon, hymn, news });
    } catch (error) {
      console.error(error);
      let message = '데이터를 불러오지 못했습니다.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      setIsErrorAll(true);
      setErrorMsgAll(message);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // row 매핑 함수
  const mapSermonRows = (items: ISermon[] = []): SermonRow[] =>
    items.map((item) => ({
      id: item.id,
      name: item.name ?? '',
      nameEn: item.nameEn ?? '',
      desc: item.desc ?? '',
      descEn: item.descEn ?? '',
      date: item.createdAt ? item.createdAt.slice(0, 10) : '',
      type: typeof item.type === 'number' ? item.type : 0,
      url: item.url ?? '',
      soulType: typeof item.viewCount === 'number' ? item.viewCount : undefined,
    }));
  const mapHymnRows = (items: IHymn[] = []): HymnRow[] =>
    items.map((item) => ({
      id: item.id,
      name: item.name ?? '',
      nameEn: item.nameEn ?? '',
      desc: item.desc ?? '',
      descEn: item.descEn ?? '',
      date: item.createdAt ? item.createdAt.slice(0, 10) : '',
      type: typeof item.type === 'number' ? item.type : 0,
      url: item.url ?? '',
    }));
  const mapNewsRows = (items: ICommunity[] = []): NewsRow[] =>
    items.map((item) => ({
      id: item.id,
      name: item.name ?? '',
      nameEn: item.nameEn ?? '',
      desc: item.desc ?? '',
      descEn: item.descEn ?? '',
      date: item.createdAt ? item.createdAt.slice(0, 10) : '',
      type: typeof item.type === 'number' ? item.type : 0,
    }));

  // 탭별 데이터/컬럼/total
  let tableData: (SermonRow | HymnRow | NewsRow)[] = [];
  const isLoading = isLoadingAll;
  const isError = isErrorAll;
  const errorMsg = errorMsgAll;
  if (selectedTab === 'sermon') {
    const items = allData.sermon;
    tableData = mapSermonRows(items as ISermon[]).sort((a, b) => b.date.localeCompare(a.date));
  } else if (selectedTab === 'hymn') {
    const items = allData.hymn;
    tableData = mapHymnRows(items as IHymn[]).sort((a, b) => b.date.localeCompare(a.date));
  } else {
    const items = allData.news;
    tableData = mapNewsRows(items as ICommunity[]).sort((a, b) => b.date.localeCompare(a.date));
  }

  // SERMON_COLUMNS를 함수 내부에서 정의하여 menuT 사용
  const SERMON_COLUMNS: ColumnDef<SermonRow>[] = [
    { accessorKey: 'name', header: menuT('Sermon.name'), size: 180 },
    { accessorKey: 'nameEn', header: menuT('Sermon.nameEn'), size: 180 },
    { accessorKey: 'desc', header: menuT('Sermon.desc'), size: 220 },
    { accessorKey: 'descEn', header: menuT('Sermon.descEn'), size: 220 },
    { accessorKey: 'date', header: t('date'), size: 110 },
    {
      accessorKey: 'type',
      header: t('type'),
      size: 90,
      cell: ({ row }) => {
        const value = row.original.type;
        return value === 0 ? menuT('Sermon.sermon') : value === 1 ? menuT('Sermon.soul') : value;
      },
    },
    {
      accessorKey: 'soulType',
      header: menuT('Sermon.soul'),
      size: 110,
      cell: ({ row }) => {
        const { type, soulType } = row.original;
        if (type !== 1 || soulType === undefined || soulType === null) return '';
        if (soulType === 2) return menuT('Sermon.spirit');
        if (soulType === 1) return menuT('Sermon.mission');
        if (soulType === 0) return menuT('Sermon.introduce');
        return '';
      },
    },
    { accessorKey: 'url', header: t('url'), size: 200 },
  ];
  const HYMN_COLUMNS: ColumnDef<HymnRow>[] = [
    { accessorKey: 'name', header: menuT('Hymn.name'), size: 180 },
    { accessorKey: 'nameEn', header: menuT('Hymn.nameEn'), size: 180 },
    { accessorKey: 'desc', header: menuT('Hymn.desc'), size: 220 },
    { accessorKey: 'descEn', header: menuT('Hymn.descEn'), size: 220 },
    { accessorKey: 'date', header: t('date'), size: 110 },
    {
      accessorKey: 'type',
      header: t('type'),
      size: 90,
      cell: ({ row }) => {
        const value = row.original.type;
        return value === 0 ? menuT('Hymn.hymn') : value === 1 ? menuT('Hymn.song') : value;
      },
    },
    { accessorKey: 'url', header: t('url'), size: 200 },
  ];
  const NEWS_COLUMNS: ColumnDef<NewsRow>[] = [
    { accessorKey: 'name', header: menuT('News.name'), size: 180 },
    { accessorKey: 'nameEn', header: menuT('News.nameEn'), size: 180 },
    { accessorKey: 'desc', header: menuT('News.desc'), size: 220 },
    { accessorKey: 'descEn', header: menuT('News.descEn'), size: 220 },
    { accessorKey: 'date', header: t('date'), size: 110 },
    {
      accessorKey: 'type',
      header: t('type'),
      size: 90,
      cell: ({ row }) => {
        const value = row.original.type;
        return value === 0
          ? menuT('News.service')
          : value === 1
            ? menuT('News.event')
            : value === 2
              ? menuT('News.story')
              : value;
      },
    },
  ];

  const tableColumns =
    selectedTab === 'sermon'
      ? SERMON_COLUMNS
      : selectedTab === 'hymn'
        ? HYMN_COLUMNS
        : NEWS_COLUMNS;

  type UploadData = {
    id?: number;
    files?: FileItem[];
    deletedFiles?: string[];
    [key: string]: unknown;
  };

  const handleSubmit = async (data: UploadData) => {
    try {
      let url = '';
      let method: 'POST' | 'PUT' = 'POST';
      let reqBody: BodyInit;
      const reqHeaders: HeadersInit = {};

      if (selectedTab === 'sermon') {
        url = '/api/sermons';
      } else if (selectedTab === 'hymn') {
        url = '/api/hymns';
      } else if (selectedTab === 'news') {
        url = '/api/communities';
      }

      if (dialogMode === 'edit') {
        if (!data.id) {
          toast.error('수정할 데이터의 id가 없습니다.');
          return;
        }
        url += `/${data.id}`;
        method = 'PUT';
      }

      if (selectedTab === 'news' && (dialogMode === 'add' || dialogMode === 'edit')) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'files' && Array.isArray(value)) {
            value.forEach((fileItem: FileItem) => {
              if (fileItem.file) {
                formData.append('files', fileItem.file);
              }
            });
          } else if (key === 'deletedFiles' && Array.isArray(value) && value.length > 0) {
            formData.append('deletedFiles', JSON.stringify(value));
          } else if (key !== 'files' && key !== 'deletedFiles' && value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        reqBody = formData;
        // Do not set Content-Type header for FormData, browser will do it
      } else {
        const body: Record<string, unknown> = { ...data };
        if (dialogMode === 'add' && 'id' in body) {
          delete body.id;
        }
        reqBody = JSON.stringify(body);
        reqHeaders['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method,
        headers: reqHeaders,
        body: reqBody,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || t('submitError'));
      }

      setDialogOpen(false);
      toast.success(t(dialogMode === 'add' ? 'submitSuccess' : 'editSuccess'));
      await fetchAll();
      await refetchStats();
    } catch (error) {
      console.error(error);
      let message = t('submitError');
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast.error(message);
    }
  };

  // 카드 클릭 핸들러
  const handleCardClick = (tab: TabType) => {
    if (selectedTab === tab) return;
    setSelectedTab(tab);
    setSelectedRowIds([]);
  };

  // 삭제 API 호출 함수
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      let baseUrl = '';
      if (selectedTab === 'sermon') baseUrl = '/api/sermons';
      else if (selectedTab === 'hymn') baseUrl = '/api/hymns';
      else if (selectedTab === 'news') baseUrl = '/api/communities';

      await Promise.all(
        selectedRowIds.map((rowIdx) => {
          const row = tableData[Number(rowIdx)];
          if (!row?.id) return Promise.resolve();
          return fetch(`${baseUrl}/${row.id}`, { method: 'DELETE' });
        })
      );
      toast.success(t('deleteSuccess', { defaultValue: '삭제가 완료되었습니다.' }));
      setSelectedRowIds([]);
      await fetchAll();
      await refetchStats();
    } catch {
      toast.error(t('deleteError', { defaultValue: '삭제 중 오류가 발생했습니다.' }));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // 툴바
  const toolbar = (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setDialogMode('add');
              setDialogOpen(true);
            }}
            aria-label={t('add')}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('add')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            disabled={selectedRowIds.length !== 1}
            aria-label={t('edit')}
            onClick={() => {
              setDialogMode('edit');
              setDialogOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('edit')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            disabled={selectedRowIds.length < 1}
            aria-label={t('delete')}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('delete')}</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] px-6 py-6">
      <section
        className={cn(
          'relative h-[600px] transition-[width] duration-200 ',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
        )}
      >
        <TextReveal text={t('dashboardTitle')} className="text-3xl font-bold mb-2" />
        {/* 현황 카드 (탭) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          {/* 설교 카드 */}
          <div
            className={`relative flex flex-col items-center p-6 rounded-xl shadow overflow-hidden cursor-pointer transition-all border-2 ${selectedTab === 'sermon' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent bg-white dark:bg-zinc-900'}`}
            onClick={() => handleCardClick('sermon')}
          >
            <BorderBeam className="opacity-30" colorFrom="#60a5fa" colorTo="#818cf8" />
            <span className="text-lg font-semibold">{menuT('Sermon.name')}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isStatsLoading ? '...' : (stats?.sermonCount ?? '-')}
            </span>
            <span className="text-sm mt-2 text-muted-foreground">
              {menuT('Sermon.sermon')}: {isStatsLoading ? '...' : (stats?.sermonRhema ?? '-')} /{' '}
              {menuT('Sermon.soul')}: {isStatsLoading ? '...' : (stats?.sermonSoul ?? '-')}
            </span>
          </div>
          {/* 찬양 카드 */}
          <div
            className={`relative flex flex-col items-center p-6 rounded-xl shadow overflow-hidden cursor-pointer transition-all border-2 ${selectedTab === 'hymn' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-transparent bg-white dark:bg-zinc-900'}`}
            onClick={() => handleCardClick('hymn')}
          >
            <BorderBeam className="opacity-30" colorFrom="#34d399" colorTo="#60a5fa" />
            <span className="text-lg font-semibold">{menuT('Hymn.name')}</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isStatsLoading ? '...' : (stats?.hymnCount ?? '-')}
            </span>
            <span className="text-sm mt-2 text-muted-foreground">
              {menuT('Hymn.hymn')}: {isStatsLoading ? '...' : (stats?.hymnHymn ?? '-')} /{' '}
              {t('hymnSong')}: {isStatsLoading ? '...' : (stats?.hymnSong ?? '-')}
            </span>
          </div>
          {/* 소식 카드 */}
          <div
            className={`relative flex flex-col items-center p-6 rounded-xl shadow overflow-hidden cursor-pointer transition-all border-2 ${selectedTab === 'news' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-transparent bg-white dark:bg-zinc-900'}`}
            onClick={() => handleCardClick('news')}
          >
            <BorderBeam className="opacity-30" colorFrom="#a78bfa" colorTo="#f472b6" />
            <span className="text-lg font-semibold">{menuT('News.name')}</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {isStatsLoading ? '...' : (stats?.newsCount ?? '-')}
            </span>
            <span className="text-sm mt-2 text-muted-foreground">
              {menuT('News.service')}: {isStatsLoading ? '...' : (stats?.newsService ?? '-')} /{' '}
              {menuT('News.event')}: {isStatsLoading ? '...' : (stats?.newsEvent ?? '-')} /{' '}
              {menuT('News.story')}: {isStatsLoading ? '...' : (stats?.newsStory ?? '-')}
            </span>
          </div>
        </div>
        {/* 툴바 + 데이터 테이블 */}
        <div className="flex flex-col gap-2 relative ">
          <div className="flex items-center justify-between mb-2">{toolbar}</div>
          {isLoading ? (
            <ContentListSkeleton count={8} />
          ) : isError ? (
            <div className="text-center text-red-500 py-8">
              {t('fetchError')}
              {errorMsg && `: ${errorMsg}`}
            </div>
          ) : (
            <DataTable<SermonRow | HymnRow | NewsRow, unknown>
              columns={tableColumns as ColumnDef<SermonRow | HymnRow | NewsRow, unknown>[]}
              data={tableData}
              onRowSelectionChange={setSelectedRowIds}
              className="h-[calc(100vh-330px)]"
            />
          )}
        </div>
        <UploadDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          mode={dialogMode}
          tabType={selectedTab}
          initialData={(() => {
            if (dialogMode !== 'edit' || selectedRowIds.length !== 1) return undefined;
            const selectedId = (tableData[Number(selectedRowIds[0])] as { id: number }).id;
            const data = allData[selectedTab].find(d => d.id === selectedId);
            if (!data) return undefined;

            // Explicitly map fields to ensure type compatibility
            return {
              id: data.id,
              name: data.name ?? undefined,
              nameEn: data.nameEn ?? undefined,
              desc: data.desc ?? undefined,
              descEn: data.descEn ?? undefined,
              date: data.createdAt?.split('T')[0] ?? undefined,
              type: data.type ?? undefined,
              url: data.url ?? undefined,
              soulType: 'viewCount' in data ? data.viewCount ?? undefined : undefined,
              files: 'files' in data ? (data.files as { url: string | null; caption: string | null }[]) : undefined,
            };
          })()}
        />
        {/* 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteConfirmTitle', { defaultValue: '삭제 확인' })}</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <div className="py-4">
              {t('deleteConfirm', { defaultValue: '정말로 삭제하시겠습니까?' })}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                {t('cancel', { defaultValue: '취소' })}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting
                  ? t('deleting', { defaultValue: '삭제 중...' })
                  : t('confirm', { defaultValue: '확인' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
