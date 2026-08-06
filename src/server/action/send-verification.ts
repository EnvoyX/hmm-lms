'use server';

import { randomBytes } from 'crypto';

import { Resend } from 'resend';

import VerifyEmailTemplate from '~/components/emails/VerifiyEmailTemplate';
import { env } from '~/env';
import { db } from '~/server/db';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name?: string) {
  try {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const existingToken = await db.verificationToken.findUnique({
      where: {
        email,
      },
    });

    if (existingToken) {
      await db.verificationToken.delete({
        where: {
          email,
        },
      });
    } else {
      await db.verificationToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });
    }
    const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
    const { data, error } = await resend.emails.send({
      from: 'HMM LMS ITB <admin@mail.hmmitb.com>',
      to: [email],
      subject: 'Verify your email address',
      react: VerifyEmailTemplate({ confirmLink, appName: 'HMM LMS ITB', name }),
    });

    console.log('Data: ', data);
    console.log('Error: ', error?.message);

    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err) {
    console.error('Error sending verification email:', err);
    return { success: false, error: 'Internal server error.' };
  }
}
