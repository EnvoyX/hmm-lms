import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Media } from './collections/Media';
import { Posts } from './collections/Posts';
import { Users } from './collections/Users';
import { env } from './env';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  routes: {
    admin: '/admin-cms',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL || '',
    },
    schemaName: 'payload_cms',
    push: env.NODE_ENV === 'development' ? true : false,
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      enabled: true,
      bucket: env.DO_SPACES_BUCKET,
      config: {
        region: env.DO_SPACES_REGION,
        credentials: {
          accessKeyId: env.DO_SPACES_KEY,
          secretAccessKey: env.DO_SPACES_SECRET,
        },
        endpoint: env.DO_SPACES_ENDPOINT,
      },
    }),
  ],
});
