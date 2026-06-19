import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  announcementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
} from "~/lib/schema/announcement";
import { AnnouncementScope } from "@prisma/client";
import { z } from "zod";
import {
  sendNotificationToMultiple,
  type NotificationPayload,
} from "~/lib/notifications";
import type { PrismaClient, Announcement, Course, PushSubscription } from "@prisma/client";

type AnnouncementWithCourse = Announcement & {
  course: Pick<Course, "title"> | null;
};

export const announcementRouter = createTRPCRouter({
  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const data = await ctx.db.announcement.create({
      data: {
        title: "Untitled Announcement",
        content: "",
        scope: AnnouncementScope.GLOBAL,
        createdById: ctx.session.user.id,
      },
    });
    
    return data;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userWithCourses = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { courses: { select: { id: true } } },
    });

    const userCourseIds = userWithCourses?.courses.map((c) => c.id) ?? [];

    return ctx.db.announcement.findMany({
      where: {
        OR: [
          { scope: AnnouncementScope.GLOBAL },
          {
            scope: AnnouncementScope.COURSE,
            courseId: { in: userCourseIds },
          },
        ],
      },
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(announcementIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.announcement.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { name: true, image: true } },
          course: { select: { title: true } },
          replies: {
            include: {
              user: { select: { name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }),

  create: adminProcedure
    .input(announcementSchema)
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.db.announcement.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
        include: {
          course: { select: { title: true } },
        },
      });

      void handleAnnouncementNotification(
        ctx.db,
        announcement,
        "created",
      ).catch((error) => {
        console.error("Failed to send announcement creation notification:", error);
      });

      return announcement;
    }),

  update: adminProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const announcement = await ctx.db.announcement.update({
        where: { id },
        data,
        include: {
          course: { select: { title: true } },
        },
      });

      void handleAnnouncementNotification(
        ctx.db,
        announcement,
        "updated",
      ).catch((error) => {
        console.error("Failed to send announcement update notification:", error);
      });

      return announcement;
    }),

  delete: adminProcedure
    .input(announcementIdSchema)
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.db.announcement.findUnique({
        where: { id: input.id },
        include: {
          course: { select: { title: true } },
        },
      });

      if (!announcement) {
        throw new Error("Announcement not found");
      }

      const deleted = await ctx.db.announcement.delete({
        where: { id: input.id },
      });

      void handleAnnouncementNotification(
        ctx.db,
        announcement,
        "deleted",
      ).catch((error) => {
        console.error("Failed to send announcement deletion notification:", error);
      });

      return deleted;
    }),

  addReply: protectedProcedure
    .input(
      z.object({
        announcementId: z.string(),
        content: z.string().min(1, "Reply cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcementReply.create({
        data: {
          announcementId: input.announcementId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          user: { select: { name: true, image: true } },
        },
      });
    }),

  deleteReply: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reply = await ctx.db.announcementReply.findUnique({
        where: { id: input.id },
      });

      if (!reply) {
        throw new Error("Reply not found");
      }

      if (reply.userId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return ctx.db.announcementReply.delete({
        where: { id: input.id },
      });
    }),
});

// Notification handler functions
async function handleAnnouncementNotification(
  db: PrismaClient,
  announcement: AnnouncementWithCourse,
  action: "created" | "updated" | "deleted",
): Promise<void> {
  const subscriptions = await getTargetSubscriptions(db, announcement);

  if (subscriptions.length === 0) {
    console.log(`No subscriptions found for announcement ${action} notification`);
    return;
  }

  const payload = buildNotificationPayload(announcement, action);
  
  const results = await sendNotificationToMultiple(
    subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    })),
    payload,
    { ttl: 86400 },
  );

  await cleanupFailedSubscriptions(db, results, subscriptions);

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `Sent ${successCount}/${subscriptions.length} announcement ${action} notifications`,
  );
}

async function getTargetSubscriptions(
  db: PrismaClient,
  announcement: AnnouncementWithCourse,
) {
  if (announcement.scope === AnnouncementScope.GLOBAL) {
    return db.pushSubscription.findMany({
      where: {
        userId: { not: announcement.createdById },
      },
    });
  }

  if (announcement.scope === AnnouncementScope.COURSE && announcement.courseId) {
    const course = await db.course.findUnique({
      where: { id: announcement.courseId },
      select: {
        members: {
          where: {
            id: { not: announcement.createdById },
          },
          select: { id: true },
        },
      },
    });

    if (!course) {
      return [];
    }

    const memberIds = course.members.map((member) => member.id);

    return db.pushSubscription.findMany({
      where: {
        userId: { in: memberIds },
      },
    });
  }

  return [];
}

function buildNotificationPayload(
  announcement: AnnouncementWithCourse,
  action: "created" | "updated" | "deleted",
): NotificationPayload {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const payloadMap: Record<
    typeof action,
    NotificationPayload
  > = {
    created: {
      title: "New Announcement",
      body: announcement.title,
      url: `${baseUrl}/announcements/${announcement.id}`,
      type: "announcement",
      tag: `announcement-${announcement.id}`,
    },
    updated: {
      title: "Announcement Updated",
      body: `"${announcement.title}" has been updated`,
      url: `${baseUrl}/announcements/${announcement.id}`,
      type: "announcement",
      tag: `announcement-${announcement.id}`,
    },
    deleted: {
      title: "Announcement Deleted",
      body: `"${announcement.title}" has been removed`,
      url: `${baseUrl}/announcements`,
      type: "announcement",
      tag: `announcement-deleted-${announcement.id}`,
    },
  };

  return payloadMap[action];
}

async function cleanupFailedSubscriptions(
  db: PrismaClient,
  results: Awaited<ReturnType<typeof sendNotificationToMultiple>>,
  subscriptions: PushSubscription[],
): Promise<void> {
  const failedEndpoints: string[] = [];

  results.forEach((result, index) => {
    const subscription = subscriptions[index];
    if (subscription && (result.shouldDelete || !result.success)) {
      failedEndpoints.push(subscription.endpoint);
    }
  });

  if (failedEndpoints.length === 0) {
    return;
  }

  await db.pushSubscription.deleteMany({
    where: { endpoint: { in: failedEndpoints } },
  });

  console.log(`Cleaned up ${failedEndpoints.length} failed/expired subscriptions`);
}
