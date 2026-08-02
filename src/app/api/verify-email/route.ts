import { NextRequest, NextResponse } from 'next/server';

import { db } from '~/server/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-error?error=MissingToken', req.url));
  }

  const existingToken = await db.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!existingToken) {
    return NextResponse.redirect(new URL('/auth/verify-error?error=InvalidToken', req.url));
  }

  if (existingToken.expiresAt < new Date()) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
    return NextResponse.redirect(
      new URL(`/auth/verify-error?error=TokenExpired&email=${existingToken.email}`, req.url),
    );
  }

  await db.$transaction([
    db.user.update({
      where: {
        email: existingToken.email,
      },
      data: {
        emailVerified: new Date(),
        verified: true,
      },
    }),
    db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    }),
  ]);

  return NextResponse.redirect(new URL('/auth/verify-success', req.url));
}
