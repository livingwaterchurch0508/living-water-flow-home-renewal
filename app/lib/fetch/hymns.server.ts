import { IHymn } from '@/app/variables/interfaces';
import { getBaseUrl } from '@/app/variables/constants';

const baseUrl = getBaseUrl();

export async function fetchHymnsServer({ page = 1, limit = 10, type = 0 }: { page?: number; limit?: number; type?: number }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: String(type),
  });
  const res = await fetch(`${baseUrl}/api/hymns?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch hymns');
  return res.json() as Promise<{
    status: 'success' | 'error';
    payload: { items: IHymn[]; total: number; totalPages: number };
  }>;
} 