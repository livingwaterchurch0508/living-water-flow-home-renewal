import { cookies } from 'next/headers';

export async function isAdminAuthenticated() {
  // admin_auth 쿠키를 비동기로 받아옵니다.
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === '1';
} 