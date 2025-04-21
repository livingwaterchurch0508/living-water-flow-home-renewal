import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(req: NextRequest) {
  const cookies = parse(req.headers.get('cookie') || '');
  const jsonData = cookies.menuInfo ? JSON.parse(cookies.menuInfo) : null;

  return new NextResponse(JSON.stringify({ data: jsonData }), { status: 200 });
}
