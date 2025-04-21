import { cookies } from 'next/headers';

export function clearSearchSessions() {
  const cookieStore = cookies();

  // Clear hymns search
  cookieStore.delete('hymns-search');

  // Clear news search
  cookieStore.delete('news-search');

  // Clear sermons search
  cookieStore.delete('sermons-search');
}
