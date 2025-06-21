'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/app/components/ui/input';
import { ShimmerButton } from '@/app/components/magicui/shimmer-button';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const locale = params.get('locale') || 'ko';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace(`/${locale}/admin`);
    } else {
      toast.error('비밀번호가 올바르지 않습니다.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-58px)] flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <div className="w-full max-w-md rounded-xl bg-white/80 dark:bg-zinc-900/80 shadow-xl p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center mb-2">Admin Login</h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <ShimmerButton type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : 'Login'}
          </ShimmerButton>
        </form>
      </div>
      <Toaster />
    </div>
  );
} 