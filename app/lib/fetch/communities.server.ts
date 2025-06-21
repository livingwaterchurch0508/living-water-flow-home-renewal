import { ICommunity } from '@/app/variables/interfaces';
import { getBaseUrl } from '@/app/variables/constants';

const baseUrl = getBaseUrl();

export async function fetchCommunitiesServer({ page = 1, limit = 10, type = 0 }: { page?: number; limit?: number; type?: number }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: String(type),
  });
  const res = await fetch(`${baseUrl}/api/communities?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch communities');

  const data: { payload: { items: ICommunity[]; total: number; totalPages: number } } = await res.json();

  return data.payload;
} 