'use server';

import { randomBytes } from 'crypto';

import { Resend } from 'resend';

import ResetPasswordTemplate from '~/components/emails/ResetPasswordTemplate';
import { env } from '~/env';
import { db } from '~/server/db';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendResetPasswordEmail(email: string, name?: string) {
  try {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const existingToken = await db.passwordResetToken.findUnique({
      where: {
        email,
      },
    });

    if (existingToken) {
      await db.passwordResetToken.delete({
        where: {
          email,
        },
      });
    }

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    const { data, error } = await resend.emails.send({
      from: 'HMM LMS ITB <admin@mail.hmmitb.com>',
      to: [email],
      subject: 'Reset your password',
      react: ResetPasswordTemplate({ confirmLink, appName: 'HMM LMS ITB', name }),
    });

    console.log('Data: ', data);
    console.log('Error: ', error?.message);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error sending reset password email:', err);
    return { success: false, error: 'Internal server error.' };
  }
}
