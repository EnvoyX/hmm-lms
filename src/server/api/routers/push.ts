// src/server/routers/push.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const pushRouter = createTRPCRouter({
  saveSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { endpoint, p256dh, auth } = input;
      const userId = ctx.session.user.id;

      // Check if subscription already exists
      const existing = await ctx.db.pushSubscription.findUnique({
        where: { endpoint },
      });

      if (existing) {
        return { success: true, message: "Already subscribed" };
      }

      await ctx.db.pushSubscription.create({
        data: {
          endpoint,
          p256dh,
          auth,
          userId,
        },
      });

      return { success: true, message: "Subscribed successfully" };
    }),
});
