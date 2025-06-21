import { redirect } from 'next/navigation';
import DashboardUI from '@/components/admin/DashboardUI';
import { isAdminAuthenticated } from '@/lib/auth';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // 관리자 인증을 비동기로 확인합니다.
  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }
  return <DashboardUI />;
}
