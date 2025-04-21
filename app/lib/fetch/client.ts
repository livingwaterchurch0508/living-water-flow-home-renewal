import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(data.error || 'An error occurred', response.status, data);
  }

  return data as T;
}

export async function fetchWithValidation<T extends z.ZodType>(
  url: string,
  schema: T,
  options?: RequestInit
): Promise<z.infer<T>> {
  const data = await fetchAPI(url, options);
  return schema.parse(data);
}

export function createQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
