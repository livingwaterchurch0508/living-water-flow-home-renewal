export interface ICardItem {
  title: string | null;
  content: string | null;
  createdAt: string | null;
  image?: string | null;
  youtube?: string | null;
  viewCount?: number | null;
  id: number;
} 