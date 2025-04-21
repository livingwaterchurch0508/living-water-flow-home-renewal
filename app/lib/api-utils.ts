import { NextResponse } from 'next/server';
import { z } from 'zod';

export const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val) || 1),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val) || 10),
  type: z
    .string()
    .optional()
    .transform((val) => Number(val) || 0),
});

export const BaseItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  desc: z.string().nullable(),
  url: z.string().nullable(),
  type: z.number(),
  viewCount: z.number().optional(),
  createdAt: z.string().nullable(),
  nameEn: z.string().nullable().optional(),
  descEn: z.string().nullable().optional(),
});

export function createResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    total: z.number(),
    totalPages: z.number(),
    items: z.array(itemSchema),
  });
}

export function createEmptyResponse() {
  return NextResponse.json({
    payload: {
      items: [],
      total: 0,
      totalPages: 0,
    },
    status: 'success',
  });
}

export function handleApiError(error: unknown) {
  console.error('[API_ERROR]', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request parameters',
        details: error.errors,
        status: 'invalid_parameters',
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      status: 'error',
    },
    { status: 500 }
  );
}

export type ApiResponse<T> =
  | {
      payload: T;
      status: 'success';
    }
  | {
      error: string;
      details?: z.ZodError['errors'];
      status: 'invalid_parameters' | 'error';
    };

export interface QueryParams {
  page: number;
  limit: number;
  type: number;
  search?: string;
}
