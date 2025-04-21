import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const jsonData = JSON.stringify(body.data);

  const cookie = serialize('menuInfo', jsonData, {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  const response = new NextResponse('Cookie set');
  response.headers.set('Set-Cookie', cookie);
  return response;
}
