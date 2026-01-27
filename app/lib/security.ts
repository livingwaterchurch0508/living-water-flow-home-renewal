import { cookies } from 'next/headers';
import crypto from 'crypto';

// ============================================
// 보안 상수
// ============================================

export const AUTH_CONFIG = {
  COOKIE_NAME: 'admin_session',
  SESSION_MAX_AGE: 60 * 60, // 1시간
  RATE_LIMIT_WINDOW: 60 * 1000, // 1분
  RATE_LIMIT_MAX_ATTEMPTS: 5, // 최대 5회 시도
} as const;

export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const,
} as const;

export const SEARCH_CONFIG = {
  MAX_QUERY_LENGTH: 100,
  MIN_QUERY_LENGTH: 1,
} as const;

// ============================================
// Rate Limiting (In-Memory)
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // 1분마다 정리

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = AUTH_CONFIG.RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: number = AUTH_CONFIG.RATE_LIMIT_WINDOW
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 새 윈도우 시작
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetIn: entry.resetTime - now,
  };
}

// ============================================
// 서명된 쿠키 (HMAC)
// ============================================

function getSecretKey(): string {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('AUTH_SECRET or ADMIN_PASSWORD must be set');
  }
  return secret;
}

export function signValue(value: string): string {
  const secret = getSecretKey();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  const signature = hmac.digest('base64url');
  return `${value}.${signature}`;
}

export function verifySignedValue(signedValue: string): string | null {
  const lastDotIndex = signedValue.lastIndexOf('.');
  if (lastDotIndex === -1) return null;

  const value = signedValue.substring(0, lastDotIndex);
  const signature = signedValue.substring(lastDotIndex + 1);

  const secret = getSecretKey();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  const expectedSignature = hmac.digest('base64url');

  // 타이밍 공격 방지를 위한 상수 시간 비교
  if (signature.length !== expectedSignature.length) return null;

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return mismatch === 0 ? value : null;
}

// ============================================
// 세션 관리
// ============================================

interface SessionData {
  isAdmin: boolean;
  createdAt: number;
  expiresAt: number;
}

export function createSessionToken(): string {
  const now = Date.now();
  const sessionData: SessionData = {
    isAdmin: true,
    createdAt: now,
    expiresAt: now + AUTH_CONFIG.SESSION_MAX_AGE * 1000,
  };
  const jsonData = JSON.stringify(sessionData);
  const base64Data = Buffer.from(jsonData).toString('base64url');
  return signValue(base64Data);
}

export function validateSessionToken(token: string): SessionData | null {
  const base64Data = verifySignedValue(token);
  if (!base64Data) return null;

  try {
    const jsonData = Buffer.from(base64Data, 'base64url').toString('utf-8');
    const sessionData: SessionData = JSON.parse(jsonData);

    // 만료 확인
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_CONFIG.COOKIE_NAME);

    if (!sessionCookie?.value) {
      return false;
    }

    const session = validateSessionToken(sessionCookie.value);
    return session?.isAdmin === true;
  } catch {
    return false;
  }
}

// ============================================
// 비밀번호 검증 (타이밍 공격 방지)
// ============================================

export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // 길이가 다르면 패딩하여 상수 시간 비교 수행 (타이밍 공격 방지)
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.alloc(maxLen);
  const paddedB = Buffer.alloc(maxLen);
  bufA.copy(paddedA);
  bufB.copy(paddedB);

  // 길이 일치 여부와 내용 비교 모두 수행
  const lengthMatch = bufA.length === bufB.length;
  const contentMatch = crypto.timingSafeEqual(paddedA, paddedB);

  return lengthMatch && contentMatch;
}

// ============================================
// 파일 업로드 검증
// ============================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // 파일 크기 검증
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`,
    };
  }

  // MIME 타입 검증
  if (
    !FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(
      file.type as (typeof FILE_UPLOAD_CONFIG.ALLOWED_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `허용되지 않는 파일 형식입니다. (허용: ${FILE_UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')})`,
    };
  }

  // 확장자 검증
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (
    !FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(
      extension as (typeof FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS)[number]
    )
  ) {
    return {
      valid: false,
      error: `허용되지 않는 파일 확장자입니다. (허용: ${FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')})`,
    };
  }

  return { valid: true };
}

export function validateFiles(files: File[]): FileValidationResult {
  // 파일 개수 검증
  if (files.length > FILE_UPLOAD_CONFIG.MAX_FILES) {
    return {
      valid: false,
      error: `파일은 최대 ${FILE_UPLOAD_CONFIG.MAX_FILES}개까지 업로드할 수 있습니다.`,
    };
  }

  // 개별 파일 검증
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// ============================================
// 검색 쿼리 검증 및 이스케이프
// ============================================

export interface SearchValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

export function validateAndSanitizeSearchQuery(query: string | null): SearchValidationResult {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: '검색어를 입력해주세요.' };
  }

  const trimmed = query.trim();

  if (trimmed.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
    return {
      valid: false,
      error: `검색어는 최소 ${SEARCH_CONFIG.MIN_QUERY_LENGTH}자 이상이어야 합니다.`,
    };
  }

  if (trimmed.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `검색어는 최대 ${SEARCH_CONFIG.MAX_QUERY_LENGTH}자까지 입력할 수 있습니다.`,
    };
  }

  // LIKE 와일드카드 이스케이프 (%, _, \)
  const sanitized = trimmed.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

  return { valid: true, sanitized };
}

// ============================================
// IP 주소 추출 (Rate Limiting용)
// ============================================

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}
