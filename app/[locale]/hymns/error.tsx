'use client';

import { ErrorBoundaryUI } from '@/components/error/ErrorBoundaryUI';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HymnsError({ error, reset }: ErrorProps) {
  return <ErrorBoundaryUI error={error} reset={reset} context="Hymns" />;
}
