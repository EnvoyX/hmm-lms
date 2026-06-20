// src/server/api/routers/notifications.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  sendNotificationToMultiple,
  type NotificationPayload,
} from "~/lib/notifications";
import { Role } from "@prisma/client";

export const notificationsRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        update: {
          p256dh: input.p256dh,
          auth: input.auth,
          userId: ctx.session.user.id,
        },
        create: {
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userId: ctx.session.user.id,
        },
      });
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pushSubscription.delete({
        where: { endpoint: input.endpoint },
      });
    }),

  // Send notification to all users
  sendToAll: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        url: z.string().optional(),
        type: z.enum([
          "announcement",
          "event",
          "tryout",
          "scholarship",
          "job",
          "course",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (
        ctx.session.user.role !== Role.ADMIN &&
        ctx.session.user.role !== Role.SUPERADMIN
      ) {
        throw new Error("Unauthorized");
      }

      const subscriptions = await ctx.db.pushSubscription.findMany({
        include: { user: true },
      });

      const payload: NotificationPayload = {
        title: input.title,
        body: input.body,
        url: input.url,
        type: input.type,
      };

      const results = await sendNotificationToMultiple(
        subscriptions.map(
          (sub) =>
            ({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            }),
        ),
        payload,
      );

      // Remove failed subscriptions
      const failedEndpoints = results
        .filter((r) => !r.success)
        .map((r) => r.subscription?.endpoint ?? "");

      if (failedEndpoints.length > 0) {
        await ctx.db.pushSubscription.deleteMany({
          where: { endpoint: { in: failedEndpoints } },
        });
      }

      return {
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      };
    }),
  
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pushSubscription.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
        createdAt: true,
      },
    });
  }),

  // Send to course members
  sendToCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string(),
        body: z.string(),
        url: z.string().optional(),
        type: z.enum(["announcement", "event", "tryout"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          members: {
            include: {
              pushSubscriptions: true,
            },
          },
        },
      });

      if (!course) throw new Error("Course not found");

      const subscriptions = course.members.flatMap((m) => m.pushSubscriptions);

      const payload: NotificationPayload = {
        title: input.title,
        body: input.body,
        url: input.url ?? `/courses/${course.classCode}`,
        type: input.type,
        tag: `course-${course.id}`,
      };

      const results = await sendNotificationToMultiple(
        subscriptions.map(
          (sub) =>
            ({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            }),
        ),
        payload,
      );

      return {
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      };
    }),

  // Get user's notification status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.pushSubscription.findFirst({
      where: { userId: ctx.session.user.id },
    });

    return {
      isSubscribed: !!subscription,
      subscription,
    };
  }),
});
