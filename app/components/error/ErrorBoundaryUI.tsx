'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryUIProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string;
}

export function ErrorBoundaryUI({ error, reset, context }: ErrorBoundaryUIProps) {
  const t = useTranslations('Error');

  useEffect(() => {
    console.error(`[${context || 'App'} Error]`, error);
  }, [error, context]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
        <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('retry')}
        </Button>
      </div>
    </div>
  );
}
