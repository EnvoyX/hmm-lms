import { TRPCError } from '@trpc/server';
import { getPayload } from 'payload';
import { z } from 'zod';

import config from '~/payload.config';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const payloadRouter = createTRPCRouter({
  getPosts: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const posts = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
    });

    return posts;
  }),
  getPost: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const slug = input.slug;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const post = await payload.find({
        collection: 'posts',
        where: {
          slug: {
            equals: slug,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!post.docs || post.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }
      return post.docs[0];
    }),
});
