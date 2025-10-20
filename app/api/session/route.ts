// app/api/session/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { user } = await req.json();

  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = {
    user: { id: user.id },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = JSON.stringify(session); // TEMP until real encryption function is fixed

  const res = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  res.cookies.set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });

  return res;
}