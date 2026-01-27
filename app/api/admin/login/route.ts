import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_CONFIG,
  checkRateLimit,
  secureCompare,
  createSessionToken,
  getClientIp,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate Limiting 체크
  const rateLimit = checkRateLimit(`login:${clientIp}`);
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil(rateLimit.resetIn / 1000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const password = typeof body.password === 'string' ? body.password : '';

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[AUTH] ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 타이밍 공격 방지를 위한 상수 시간 비교
    const isValid = secureCompare(password, adminPassword);

    if (!isValid) {
      // 실패 로그 (IP만 기록, 비밀번호는 기록하지 않음)
      console.warn(`[AUTH] Failed login attempt from IP: ${clientIp}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // 세션 토큰 생성
    const sessionToken = createSessionToken();

    const res = NextResponse.json({ success: true });
    res.cookies.set(AUTH_CONFIG.COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_CONFIG.SESSION_MAX_AGE,
    });

    return res;
  } catch (error) {
    console.error('[AUTH] Login error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// 로그아웃
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(AUTH_CONFIG.COOKIE_NAME);
  return res;
}