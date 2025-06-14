import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', '1', { httpOnly: true, path: '/', maxAge: 60 * 60 * 6 });
    return res;
  }
  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
} 