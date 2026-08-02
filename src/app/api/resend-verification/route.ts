import { NextRequest, NextResponse } from 'next/server';

import { sendVerificationEmail } from '~/server/action/send-verification';
import { db } from '~/server/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/auth/verify-error?error=MissingEmail', req.url));
  }
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!existingUser) {
    return NextResponse.redirect(new URL('/auth/verify-error?error=UserNotFound', req.url));
  }

  await sendVerificationEmail(email, existingUser.name);

  return NextResponse.redirect(new URL('/auth/resend-success', req.url));
}
