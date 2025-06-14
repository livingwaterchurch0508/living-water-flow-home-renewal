'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { ShimmerButton } from '@/app/components/magicui/shimmer-button';
import { SERMON_TAB, HYMN_TAB, NEWS_TAB, SOUL_TYPE } from '@/app/variables/enums';
import Image from 'next/image';

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
  .refine((data) => {
    if (data.type === 1) {
      return data.soulType !== undefined;
    }
    return true;
  }, {
    message: 'SOUL_TYPE_REQUIRED',
    path: ['soulType'],
  })
  .refine((data) => {
    if (data.type === 0) {
      return !!data.url;
    }
    return true;
  }, {
    message: 'URL_REQUIRED',
    path: ['url'],
  });

export interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof schema> & { id?: number }) => void;
  mode: 'add' | 'edit';
  initialData?: Partial<z.infer<typeof schema>> & { id?: number };
  tabType: 'sermon' | 'hymn' | 'news';
}

// enum -> [{ value, label }] 변환 유틸
function enumToOptions<T extends object>(enm: T, labelMap: Record<number, string>) {
  return Object.entries(enm)
    .filter(([, v]) => typeof v === 'number')
    .map(([, v]) => ({ value: v as number, label: labelMap[v as number] || String(v) }));
}

export default function UploadDialog({ open, onClose, onSubmit, mode, initialData, tabType }: UploadDialogProps) {
  const t = useTranslations('Admin');
  const menuT = useTranslations('Menu');
  const [form, setForm] = useState<{
    type: SERMON_TAB | HYMN_TAB | NEWS_TAB;
    soulType?: SOUL_TYPE;
    name: string;
    nameEn: string;
    desc: string;
    descEn: string;
    date: string;
    url: string;
    id?: number;
  }>({
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
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        type: initialData.type ?? 0,
        soulType: initialData.soulType ?? 0,
        name: initialData.name ?? '',
        nameEn: initialData.nameEn ?? '',
        desc: initialData.desc ?? '',
        descEn: initialData.descEn ?? '',
        date: initialData.date ?? '',
        url: initialData.url ?? '',
        id: initialData.id,
      });
    } else if (mode === 'add') {
      setForm({
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
    }
  }, [mode, initialData, open]);

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    // 유효성 검사: 설교-영의말씀은 url optional, 나머지는 url required
    let customSchema = baseSchema;
    if (tabType === 'sermon' && form.type === SERMON_TAB.SOUL) {
      customSchema = baseSchema.extend({ url: z.string().optional() });
    }
    let result;
    if (tabType === 'sermon' && form.type === SERMON_TAB.SOUL) {
      result = customSchema.safeParse(form);
    } else {
      result = schema.safeParse(form);
    }
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
    onSubmit({ ...result.data, id: form.id });
    setIsSubmitting(false);
    onClose();
  };

  const getDialogTitle = () => {
    let label = '';
    if (tabType === 'sermon') label = menuT('Sermon.name');
    else if (tabType === 'hymn') label = menuT('Hymn.name');
    else if (tabType === 'news') label = menuT('News.name');
    return `${label} ${mode === 'add' ? t('add', { defaultValue: '추가' }) : t('edit', { defaultValue: '수정' })}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    setFilePreviews(fileList.map(file => URL.createObjectURL(file)));
  };

  // filePreviews URL 해제
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  // enum 라벨 상수들을 UploadDialog 함수 내부로 이동
  const SERMON_TYPE_LABELS = { 0: menuT('Sermon.sermon'), 1: menuT('Sermon.soul') };
  const HYMN_TYPE_LABELS = { 0: menuT('Hymn.hymn'), 1: menuT('Hymn.song') };
  const NEWS_TYPE_LABELS = { 0: menuT('News.service'), 1: menuT('News.event'), 2: menuT('News.story') };
  const SOUL_TYPE_LABELS = { 0: menuT('Sermon.introduce'), 1: menuT('Sermon.mission'), 2: menuT('Sermon.spirit') };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="space-y-4">
          {/* 1. 타입 선택 (공통) */}
          <div>
            <label className="block font-medium mb-1">
              {tabType === 'sermon' ? menuT('Sermon.name') : tabType === 'hymn' ? menuT('Hymn.name') : menuT('News.name')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(tabType === 'sermon'
                ? enumToOptions(SERMON_TAB, SERMON_TYPE_LABELS)
                : tabType === 'hymn'
                  ? enumToOptions(HYMN_TAB, HYMN_TYPE_LABELS)
                  : enumToOptions(NEWS_TAB, NEWS_TYPE_LABELS)
                ).map(opt => (
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
              <label className="block font-medium mb-1">영의말씀 세부유형 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {enumToOptions(SOUL_TYPE, SOUL_TYPE_LABELS).map(opt => (
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
          {(
            (tabType === 'sermon' && form.type === SERMON_TAB.RHEMA) ||
            tabType === 'hymn'
          ) && (
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
            <div>
              <label className="block font-medium mb-1">
                {t('photoUpload')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {filePreviews.map((src, idx) => (
                  <Image
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                    width={80}
                    height={80}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-6">
          <ShimmerButton onClick={handleSubmit} disabled={isSubmitting}>
            {mode === 'add' ? t('submit') : t('edit', { defaultValue: '수정' })}
          </ShimmerButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 