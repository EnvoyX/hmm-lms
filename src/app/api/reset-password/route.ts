import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '~/lib/utils';
import { db } from '~/server/db';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 },
      );
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token', redirect: '/auth/request-reset-password' },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });
      return NextResponse.json(
        { error: 'Reset token has expired', redirect: '/auth/request-reset-password' },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    await db.$transaction([
      db.user.update({
        where: {
          email: resetToken.email,
        },
        data: {
          password: hashedPassword,
        },
      }),
      db.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
