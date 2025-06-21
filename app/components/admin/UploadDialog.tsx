'use client';
import { useState, useEffect, type ChangeEvent, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { ShimmerButton } from '@/app/components/magicui/shimmer-button';
import { SERMON_TAB, HYMN_TAB, NEWS_TAB, SOUL_TYPE } from '@/app/variables/enums';
import Image from 'next/image';
import { useIsMobile } from '@/app/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
  DrawerClose,
} from '@/app/components/ui/drawer';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Button } from '@/app/components/ui/button';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

const baseSchema = z.object({
  type: z.number(),
  soulType: z.number().optional(),
  name: z.string().min(1),
  nameEn: z.string().min(1),
  desc: z.string().min(1),
  descEn: z.string().min(1),
  date: z.string().min(1),
  url: z.string().min(1).optional(),
});

export const schema = baseSchema
  .refine(
    (data) => {
      if (data.type === 1) {
        return data.soulType !== undefined;
      }
      return true;
    },
    {
      message: 'SOUL_TYPE_REQUIRED',
      path: ['soulType'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 0) {
        return !!data.url;
      }
      return true;
    },
    {
      message: 'URL_REQUIRED',
      path: ['url'],
    }
  );

export interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof schema> & { id?: number; files?: FileItem[], deletedFiles?: string[] }) => void;
  mode: 'add' | 'edit';
  initialData?: Partial<z.infer<typeof schema>> & { id?: number; files?: { url: string | null; caption: string | null }[] };
  tabType: 'sermon' | 'hymn' | 'news';
}

type UploadFormState = {
  type: SERMON_TAB | HYMN_TAB | NEWS_TAB;
  soulType?: SOUL_TYPE;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  date: string;
  url: string;
  id?: number;
};

export type FileItem = {
  id: string;
  file?: File;
  name: string;
  preview: string;
};

// enum -> [{ value, label }] 변환 유틸
function enumToOptions<T extends object>(enm: T, labelMap: Record<number, string>) {
  return Object.entries(enm)
    .filter(([, v]) => typeof v === 'number')
    .map(([, v]) => ({ value: v as number, label: labelMap[v as number] || String(v) }));
}

const SortablePhotoItem = ({
  id,
  preview,
  onRemove,
  index,
}: {
  id: string;
  preview: string;
  onRemove: (id: string) => void;
  index: number;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <Image
        src={preview}
        alt={`preview-${id}`}
        className="w-20 h-20 object-cover rounded border"
        width={80}
        height={80}
      />
      <div className="absolute top-0 left-0 -m-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {index + 1}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-800 text-white rounded-full p-1 leading-none"
        aria-label="Remove image"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

const UploadForm = ({
  form,
  errors,
  tabType,
  handleChange,
  handleFileChange,
  files,
  onFileRemove,
  onSortEnd,
}: {
  form: UploadFormState;
  errors: Record<string, string>;
  tabType: 'sermon' | 'hymn' | 'news';
  handleChange: (field: string, value: unknown) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  files: FileItem[];
  onFileRemove: (id: string) => void;
  onSortEnd: (event: DragEndEvent) => void;
}) => {
  const t = useTranslations('Admin');
  const menuT = useTranslations('Menu');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag starts sort
      },
    })
  );

  const SERMON_TYPE_LABELS = { 0: menuT('Sermon.sermon'), 1: menuT('Sermon.soul') };
  const HYMN_TYPE_LABELS = { 0: menuT('Hymn.hymn'), 1: menuT('Hymn.song') };
  const NEWS_TYPE_LABELS = {
    0: menuT('News.service'),
    1: menuT('News.event'),
    2: menuT('News.story'),
  };
  const SOUL_TYPE_LABELS = {
    0: menuT('Sermon.introduce'),
    1: menuT('Sermon.mission'),
    2: menuT('Sermon.spirit'),
  };

  return (
    <div className="space-y-4">
      {/* 1. 타입 선택 (공통) */}
      <div>
        <label className="block font-medium mb-1">
          {tabType === 'sermon'
            ? menuT('Sermon.name')
            : tabType === 'hymn'
              ? menuT('Hymn.name')
              : menuT('News.name')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {(tabType === 'sermon'
            ? enumToOptions(SERMON_TAB, SERMON_TYPE_LABELS)
            : tabType === 'hymn'
              ? enumToOptions(HYMN_TAB, HYMN_TYPE_LABELS)
              : enumToOptions(NEWS_TAB, NEWS_TYPE_LABELS)
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`px-3 py-1 rounded border ${form.type === opt.value ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800'}`}
              onClick={() => handleChange('type', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {/* 2. 영의말씀 세부 타입 (설교, type=1) */}
      {tabType === 'sermon' && form.type === SERMON_TAB.SOUL && (
        <div>
          <label className="block font-medium mb-1">
            영의말씀 세부유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {enumToOptions(SOUL_TYPE, SOUL_TYPE_LABELS).map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`px-3 py-1 rounded border ${form.soulType === opt.value ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800'}`}
                onClick={() => handleChange('soulType', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.soulType && <div className="text-red-500 text-xs mt-1">{errors.soulType}</div>}
        </div>
      )}
      {/* 3. 제목(한글) */}
      <div>
        <label className="block font-medium mb-1">
          {t('titleKo')} <span className="text-red-500">*</span>
        </label>
        <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      {/* 4. 제목(영어) */}
      <div>
        <label className="block font-medium mb-1">
          {t('titleEn')} <span className="text-red-500">*</span>
        </label>
        <Input value={form.nameEn} onChange={(e) => handleChange('nameEn', e.target.value)} />
        {errors.nameEn && <div className="text-red-500 text-xs mt-1">{errors.nameEn}</div>}
      </div>
      {/* 5. 설명(한글) */}
      <div>
        <label className="block font-medium mb-1">
          {t('descKo')} <span className="text-red-500">*</span>
        </label>
        <Input value={form.desc} onChange={(e) => handleChange('desc', e.target.value)} />
        {errors.desc && <div className="text-red-500 text-xs mt-1">{errors.desc}</div>}
      </div>
      {/* 6. 설명(영어) */}
      <div>
        <label className="block font-medium mb-1">
          {t('descEn')} <span className="text-red-500">*</span>
        </label>
        <Input value={form.descEn} onChange={(e) => handleChange('descEn', e.target.value)} />
        {errors.descEn && <div className="text-red-500 text-xs mt-1">{errors.descEn}</div>}
      </div>
      {/* 7. 날짜(캘린더) */}
      <div>
        <label className="block font-medium mb-1">
          {t('date')} <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
        {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
      </div>
      {/* 8. YouTube URL (설교: type=설교영상, 찬양: 항상) */}
      {((tabType === 'sermon' && form.type === SERMON_TAB.RHEMA) || tabType === 'hymn') && (
        <div>
          <label className="block font-medium mb-1">
            {t('youtubeUrl')} <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder={t('urlRequired')}
          />
          {errors.url && <div className="text-red-500 text-xs mt-1">{errors.url}</div>}
        </div>
      )}
      {/* 8. 사진 업로드 (소식만) */}
      {tabType === 'news' && (
        <div className="mt-4">
          <label className="block font-medium mb-1">{t('photoUpload')}</label>
          <Input type="file" multiple onChange={handleFileChange} accept="image/*" />
          <ScrollArea className="mt-4 h-48 w-full rounded-md border">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSortEnd}>
              <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-4 gap-4 p-4">
                  {files.map((file, index) => (
                    <SortablePhotoItem
                      key={file.id}
                      id={file.id}
                      preview={file.preview}
                      onRemove={onFileRemove}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default function UploadDialog({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
  tabType,
}: UploadDialogProps) {
  const t = useTranslations('Admin');
  const menuT = useTranslations('Menu');
  const [form, setForm] = useState<UploadFormState>({
    type: 0,
    soulType: 0,
    name: '',
    nameEn: '',
    desc: '',
    descEn: '',
    date: '',
    url: '',
    id: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          type:
            initialData.type ??
            (tabType === 'sermon'
              ? SERMON_TAB.RHEMA
              : tabType === 'hymn'
                ? HYMN_TAB.HYMN
                : NEWS_TAB.NEWS),
          soulType: initialData.soulType ?? 0,
          name: initialData.name ?? '',
          nameEn: initialData.nameEn ?? '',
          desc: initialData.desc ?? '',
          descEn: initialData.descEn ?? '',
          date: initialData.date ? initialData.date.split('T')[0] : '',
          url: initialData.url ?? '',
          id: initialData.id,
        });

        const existingFiles = (initialData.files || []).flatMap((fileInfo: { url: string | null; caption: string | null }) => {
          const fileCount = parseInt(fileInfo.caption || '0', 10);
          if (!fileInfo.url || isNaN(fileCount)) return [];

          return Array.from({ length: fileCount }, (_, i) => {
            const fileName = `${i + 1}.jpg`; // Assuming .jpg, adjust if needed
            return {
              id: fileName,
              name: fileName,
              preview: `/api/image?imageName=${fileInfo.url}${fileName}`,
            };
          });
        });
        setFiles(existingFiles);

      } else {
        // 'add' mode
        setForm({
          type:
            tabType === 'sermon'
              ? SERMON_TAB.RHEMA
              : tabType === 'hymn'
                ? HYMN_TAB.HYMN
                : NEWS_TAB.NEWS,
          soulType: 0,
          name: '',
          nameEn: '',
          desc: '',
          descEn: '',
          date: new Date().toISOString().split('T')[0],
          url: '',
          id: undefined,
        });
      }
      setFiles([]); // Reset files when dialog opens
      setDeletedFiles([]);
    } else {
      setErrors({});
    }
  }, [open, mode, initialData, tabType]);

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    // 유효성 검사: 설교-영의말씀, 소식 탭은 url optional, 나머지는 url required
    let customSchema = baseSchema;
    if (tabType === 'sermon' && form.type === SERMON_TAB.SOUL || tabType === 'news') {
      customSchema = baseSchema.extend({ url: z.string().optional() });
    }
    const result = customSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.errors) {
        if (err.message === 'SOUL_TYPE_REQUIRED') fieldErrors['soulType'] = t('soulTypeRequired');
        else if (err.message === 'URL_REQUIRED') fieldErrors['url'] = t('urlRequired');
        else fieldErrors[err.path[0]] = t('required');
      }
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const finalData = {
      ...result.data,
      id: form.id,
      files: files.filter(f => f.file), // Only send new files
      deletedFiles,
    };

    onSubmit(finalData);
    setIsSubmitting(false);
    onClose();
  }, [form, files, onSubmit, onClose, tabType, t]);

  const getDialogTitle = () => {
    let label = '';
    if (tabType === 'sermon') label = menuT('Sermon.name');
    else if (tabType === 'hymn') label = menuT('Hymn.name');
    else if (tabType === 'news') label = menuT('News.name');
    return `${label} ${mode === 'add' ? t('add', { defaultValue: '추가' }) : t('edit', { defaultValue: '수정' })}`;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles: FileItem[] = Array.from(e.target.files).map(file => {
      const id = `${file.name}-${file.lastModified}-${Math.random()}`; // Add random number for uniqueness
      return {
        id,
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = ''; // Reset file input
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (!fileToRemove) return;

    // If it's an existing file (not a new upload), add to deletedFiles list
    if (!fileToRemove.file) {
      setDeletedFiles(prev => [...prev, fileToRemove.name]);
    }

    // Remove from main files list to hide it
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  }, [files]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const isMobile = useIsMobile();

  const formProps = {
    form,
    errors,
    tabType,
    handleChange,
    handleFileChange,
    files,
    onFileRemove: handleFileRemove,
    onSortEnd: handleDragEnd,
  };

  const formContent = (
    <ScrollArea className="h-[80vh] md:h-auto md:max-h-[80vh]">
      <div className="p-6 md:p-0">
        <UploadForm {...formProps} />
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{getDialogTitle()}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          {formContent}
          <DrawerFooter className="pt-2">
            <ShimmerButton onClick={handleSubmit} disabled={isSubmitting}>
              {mode === 'add' ? t('submit') : t('edit', { defaultValue: '수정' })}
            </ShimmerButton>
            <DrawerClose asChild>
              <Button variant="outline">{t('cancel', { defaultValue: '취소' })}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {formContent}
        <DialogFooter className="mt-6">
          <ShimmerButton onClick={handleSubmit} disabled={isSubmitting}>
            {mode === 'add' ? t('submit') : t('edit', { defaultValue: '수정' })}
          </ShimmerButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
