import { getPayload } from 'payload';

import config from '~/payload.config';

interface SyncPrismaUserParams {
  prismaId: string;
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export async function syncAdminToPayload({
  prismaId,
  email,
  password,
  name,
  role,
}: SyncPrismaUserParams) {
  const payload = await getPayload({ config });

  console.log('finding Payload user with email...', email);
  const existingPayloadUser = await payload.find({
    collection: 'users',
    where: {
      or: [{ prismaId: { equals: prismaId } }, { email: { equals: email } }],
    },
    limit: 1,
  });

  const existingUser = existingPayloadUser.docs[0];

  if (!existingUser && password) {
    console.log(
      'Payload with this email does not exist, creating Payload user with email...',
      email,
    );
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
        prismaId,
        role,
      },
    });
  } else if (existingUser && password) {
    console.log('Payload with this email exist, updating Payload user with email...', email);
    await payload.update({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      data: {
        password,
        name,
        prismaId,
        role,
      },
    });
  }
}
