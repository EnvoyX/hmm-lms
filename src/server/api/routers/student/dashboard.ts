// ~/server/api/routers/student-dashboard.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { endOfDay, endOfWeek, getISOWeek, getISOWeekYear, startOfDay, startOfWeek, subDays } from "date-fns";
import type { Prisma } from "@prisma/client";

export const studentDashboardRouter = createTRPCRouter({
  // Get enrolled courses with progress
  getEnrolledCourses: protectedProcedure.query(async ({ ctx }) => {
    // 1) Fetch enrolled, active courses with user-scoped learningSession data
    const courses = await ctx.db.course.findMany({
      where: {
        members: { some: { id: ctx.session.user.id } },
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        classCode: true,
        _count: {
          select: {
            learningSession: {
              where: { userId: ctx.session.user.id },
            },
          },
        },
        learningSession: {
          where: { userId: ctx.session.user.id },
          select: { duration: true },
        },
      },
      orderBy: {
        learningSession: {
          _count: 'desc',
        },
      },
      // take: 6, // removed as requested
    });

    const courseIds = courses.map(c => c.id);
    if (courseIds.length === 0) {
      return [];
    }

    // 2) Aggregate link counts per course
    const videoCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        type: 'LINK',
        isActive: true,
        category: 'VIDEO'
      },
      _count: { _all: true },
    });

    // 3) Aggregate attachment (file) counts per course
    const fileCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        category: {
          not: 'VIDEO'
        },
        isActive: true,
      },
      _count: { _all: true },
    });

    const videoMap = new Map(videoCounts.map(r => [r.attachableId, r._count._all]));

    const fileMap = new Map(fileCounts.map(r => [r.attachableId, r._count._all]));

    // 4) Shape final payload
    return courses.map(course => {
      const totalMinutes = course.learningSession.reduce((sum, s) => sum + s.duration, 0) / 60;
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        classCode: course.classCode,
        totalSessions: course._count.learningSession,
        totalMinutes,
        videoCount: videoMap.get(course.id) ?? 0,
        attachmentsCount: fileMap.get(course.id) ?? 0,
      };
    });
  }),


  getWeeklyHallOfFame: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(3).max(50).default(20),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const whereClause: Prisma.LearningSessionWhereInput = {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      };

      const grouped = await ctx.db.learningSession.groupBy({
        by: ["userId"],
        where: whereClause,
        _sum: {
          duration: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            duration: "desc",
          },
        },
        take: input?.limit ?? 20,
      });

      const userIds = grouped.map((item) => item.userId);
      const users = userIds.length
        ? await ctx.db.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
        : [];

      const leaderboard = grouped.map((item, index) => {
        const user = users.find((entry) => entry.id === item.userId);
        return {
          rank: index + 1,
          userId: item.userId,
          userName: user?.name ?? "Anonymous Learner",
          userImage: user?.image ?? null,
          weeklyDurationSeconds: item._sum.duration ?? 0,
          totalSessions: item._count.id,
          isCurrentUser: item.userId === ctx.session.user.id,
        };
      });

      const currentUserRank = leaderboard.find((item) => item.isCurrentUser) ?? null;
      const currentWeekKey = `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, "0")}`;

      return {
        currentWeekKey,
        weekStart,
        weekEnd,
        leaderboard,
        currentUserRank,
      };
    }),

  // Get events for calendar (simplified without approval)
  getCalendarEvents: protectedProcedure
    .input(
      z.object({
        month: z.number().min(0).max(11),
        year: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month, 1);
      const endDate = new Date(input.year, input.month + 1, 0);

      // Get user's courses
      const userCourses = await ctx.db.course.findMany({
        where: {
          members: {
            some: { id: ctx.session.user.id },
          },
        },
        select: { id: true },
      });

      const courseIds = userCourses.map((course) => course.id);

      // Get events for the month
      const events = await ctx.db.event.findMany({
        where: {
          start: {
            gte: startDate,
            lte: endDate,
          },
          OR: [
            { courseId: null, userId: null }, // Global events
            { courseId: { in: courseIds } }, // Course events
            { userId: ctx.session.user.id }, // Personal events
          ],
        },
        include: {
          course: {
            select: { title: true, classCode: true },
          },
          _count: {
            select: {
              rsvpResponses: {
                where: { status: "YES" },
              },
            },
          },
          rsvpResponses: {
            where: { userId: ctx.session.user.id },
            select: {
              status: true,
            },
          },
          presenceRecords: {
            where: { userId: ctx.session.user.id },
            select: {
              status: true,
              checkedInAt: true,
            },
          },
        },
        orderBy: { start: "asc" },
      });

      return events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        eventMode: event.eventMode,
        course: event.course,
        rsvpCount: event._count.rsvpResponses,
        userRsvpStatus: event.rsvpResponses[0]?.status ?? null,
        userPresenceStatus: event.presenceRecords[0]?.status ?? null,
        hasCheckedIn: event.presenceRecords.length > 0,
      }));
    }),

  // Get events for a specific date
  getEventsForDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const start = startOfDay(input.date);
      const end = endOfDay(input.date);

      // Get user's courses
      const userCourses = await ctx.db.course.findMany({
        where: {
          members: {
            some: { id: ctx.session.user.id },
          },
        },
        select: { id: true },
      });

      const courseIds = userCourses.map((course) => course.id);

      const events = await ctx.db.event.findMany({
        where: {
          start: {
            gte: start,
            lte: end,
          },
          OR: [
            { courseId: null, userId: null },
            { courseId: { in: courseIds } },
            { userId: ctx.session.user.id },
          ],
        },
        include: {
          course: {
            select: { title: true, classCode: true },
          },
          createdBy: {
            select: { name: true },
          },
          _count: {
            select: {
              rsvpResponses: {
                where: { status: "YES" },
              },
            },
          },
          rsvpResponses: {
            where: { userId: ctx.session.user.id },
          },
          presenceRecords: {
            where: { userId: ctx.session.user.id },
          },
        },
        orderBy: { start: "asc" },
      });

      return events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        eventMode: event.eventMode,
        course: event.course,
        createdBy: event.createdBy,
        rsvpCount: event._count.rsvpResponses,
        userRsvp: event.rsvpResponses[0] ?? null,
        userPresence: event.presenceRecords[0] ?? null,
      }));
    }),

  // Get dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);

    const [totalCourses, todaySessions, weekSessions, upcomingEvents] =
      await Promise.all([
        ctx.db.course.count({
          where: {
            members: {
              some: { id: ctx.session.user.id },
            },
            isActive: true,
          },
        }),
        ctx.db.learningSession.count({
          where: {
            userId: ctx.session.user.id,
            date: { gte: today },
          },
        }),
        ctx.db.learningSession.aggregate({
          where: {
            userId: ctx.session.user.id,
            date: { gte: last7Days },
          },
          _sum: { duration: true },
        }),
        ctx.db.event.count({
          where: {
            start: { gte: new Date() },
            OR: [
              { courseId: null, userId: null },
              {
                course: {
                  members: {
                    some: { id: ctx.session.user.id },
                  },
                },
              },
              { userId: ctx.session.user.id },
            ],
          },
        }),
      ]);

    return {
      totalCourses,
      todaySessions,
      weekMinutes: Math.round((weekSessions._sum.duration ?? 0) / 60),
      upcomingEvents,
    };
  }),
});
