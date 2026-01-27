'use client';

import { ErrorBoundaryUI } from '@/components/error/ErrorBoundaryUI';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  return <ErrorBoundaryUI error={error} reset={reset} context="Admin" />;
}
