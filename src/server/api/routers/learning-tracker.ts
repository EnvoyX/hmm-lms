import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from '@trpc/server';

const HEARTBEAT_INTERVAL_SECONDS = 15;
const SESSION_TIMEOUT_SECONDS = HEARTBEAT_INTERVAL_SECONDS * 2; // 90 seconds
const MIN_SESSION_DURATION = 5; // Minimum 5 seconds to count as a session

export const trackingRouter = createTRPCRouter({
  heartbeat: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const { courseId } = input;
      const userId = session.user.id;
      const now = new Date();

      // --- FIX: ADDED VALIDATION GUARD CLAUSE ---
      // Verify that the course exists and the user is enrolled before doing anything else.
      const courseEnrollment = await db.course.findFirst({
        where: {
          id: courseId,
          members: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (!courseEnrollment) {
        // If no enrollment is found, the courseId is invalid for this user.
        // Stop execution and inform the client.
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Course not found or you are not enrolled. Tracking will be stopped.",
        });
      }
      // --- END FIX ---

      // Get the start of the current day in UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Find the most recent session for this user, course, and date
      const recentSession = await db.learningSession.findFirst({
        where: {
          userId,
          courseId,
          date: today,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (!recentSession) {
        // Create first session of the day
        console.log("Creating new learning session");
        return db.learningSession.create({
          data: {
            userId,
            courseId,
            date: today,
            duration: MIN_SESSION_DURATION, // Start with minimum duration
          },
        });
      }

      // Calculate time since last update
      const timeSinceLastUpdate =
        (now.getTime() - recentSession.updatedAt.getTime()) / 1000;

      if (timeSinceLastUpdate < SESSION_TIMEOUT_SECONDS) {
        // This is a continuation of the existing session
        const timeToAdd = Math.min(
          Math.max(timeSinceLastUpdate, 1), // At least 1 second
          HEARTBEAT_INTERVAL_SECONDS + 10,
        );
        console.log(
          `Continuing session: adding ${Math.round(timeToAdd)} seconds`,
        );
        return db.learningSession.update({
          where: {
            id: recentSession.id,
          },
          data: {
            duration: {
              increment: Math.round(timeToAdd),
            },
          },
        });
      } else {
        // Too much time has passed, create a new session
        console.log(
          `Creating new session - gap too large: ${timeSinceLastUpdate}s`,
        );
        return db.learningSession.create({
          data: {
            userId,
            courseId,
            date: today,
            duration: MIN_SESSION_DURATION,
          },
        });
      }
    }),

  getDailySummary: protectedProcedure
    .input(z.object({ date: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const userId = session.user.id;

      const targetDate = input.date ?? new Date();
      targetDate.setUTCHours(0, 0, 0, 0);

      const summary = await db.learningSession.aggregate({
        where: {
          userId,
          date: targetDate,
        },
        _sum: {
          duration: true,
        },
      });

      return {
        totalDurationSeconds: summary._sum.duration ?? 0,
      };
    }),

  getWeeklySummary: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const userId = session.user.id;

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setUTCHours(0, 0, 0, 0);

    const sessions = await db.learningSession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        duration: true,
      },
    });

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);

      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const totalDurationSeconds = sessions
        .filter((s) => s.date.getTime() === date.getTime())
        .reduce((sum, s) => sum + s.duration, 0);

      weeklyData.push({
        date,
        dayName,
        totalDurationSeconds,
      });
    }

    return weeklyData;
  }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const userId = session.user.id;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalTryouts, weeklyMinutes, activeCourses] = await Promise.all([
      db.userAttempt.count({
        where: { userId },
      }),
      db.learningSession.aggregate({
        where: {
          userId,
          date: {
            gte: oneWeekAgo,
          },
        },
        _sum: { duration: true },
      }),
      db.learningSession.findMany({
        where: { userId },
        select: { courseId: true },
        distinct: ["courseId"],
      }),
    ]);

    return {
      totalTryouts,
      weeklyMinutes: Math.round((weeklyMinutes._sum.duration ?? 0) / 60),
      activeCourses: activeCourses.length,
    };
  }),

  getAllUsersAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        courseId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { startDate, endDate, courseId } = input;

      const whereClause: Prisma.LearningSessionWhereInput = {};

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = startDate;
        }
        if (endDate) {
          whereClause.date.lte = endDate;
        }
      }

      if (courseId) {
        whereClause.courseId = courseId;
      }

      const analytics = await db.learningSession.groupBy({
        by: ["userId"],
        where: whereClause,
        _sum: {
          duration: true,
        },
        _count: {
          id: true,
        },
      });

      const userIds = analytics.map((a) => a.userId);
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          nim: true,
          faculty: true,
          program: true,
        },
      });

      return analytics.map((stat) => {
        const user = users.find((u) => u.id === stat.userId);
        const totalDuration = stat._sum.duration ?? 0;
        const sessionCount = stat._count.id;

        return {
          user: user ?? null,
          totalDurationSeconds: totalDuration,
          totalSessions: sessionCount,
          averageSessionMinutes:
            totalDuration && sessionCount
              ? Math.round(totalDuration / sessionCount / 60)
              : 0,
        };
      });
    }),

  getCourseAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { startDate, endDate } = input;

      const whereClause: Prisma.LearningSessionWhereInput = {};

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = startDate;
        }
        if (endDate) {
          whereClause.date.lte = endDate;
        }
      }

      const courseStats = await db.learningSession.groupBy({
        by: ["courseId"],
        where: whereClause,
        _sum: {
          duration: true,
        },
        _count: {
          id: true,
        },
      });

      const courseIds = courseStats.map((s) => s.courseId);
      const courses = await db.course.findMany({
        where: { id: { in: courseIds } },
        select: {
          id: true,
          title: true,
          classCode: true,
        },
      });

      return courseStats.map((stat) => {
        const course = courses.find((c) => c.id === stat.courseId);
        const totalDuration = stat._sum.duration ?? 0;
        const sessionCount = stat._count.id;

        return {
          course: course ?? null,
          totalDurationSeconds: totalDuration,
          totalSessions: sessionCount,
          averageSessionMinutes:
            totalDuration && sessionCount
              ? Math.round(totalDuration / sessionCount / 60)
              : 0,
        };
      });
    }),

  getTopLearners: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, startDate, endDate } = input;

      const whereClause: Prisma.LearningSessionWhereInput = {};

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = startDate;
        }
        if (endDate) {
          whereClause.date.lte = endDate;
        }
      }

      const topLearners = await db.learningSession.groupBy({
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
        take: limit,
      });

      const userIds = topLearners.map((learner) => learner.userId);
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          nim: true,
          faculty: true,
          program: true,
          image: true,
        },
      });

      return topLearners.map((learner, index) => {
        const user = users.find((u) => u.id === learner.userId);
        const totalDuration = learner._sum.duration ?? 0;
        const sessionCount = learner._count.id;

        return {
          rank: index + 1,
          user: user ?? null,
          totalDurationSeconds: totalDuration,
          totalSessions: sessionCount,
          averageSessionMinutes:
            totalDuration && sessionCount
              ? Math.round(totalDuration / sessionCount / 60)
              : 0,
        };
      });
    }),

  getSystemStats: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      totalLearningTime,
      totalSessions,
      avgSessionDuration,
    ] = await Promise.all([
      db.user.count(),
      db.learningSession
        .findMany({
          where: { date: { gte: todayStart } },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((sessions) => sessions.length),
      db.learningSession
        .findMany({
          where: { date: { gte: weekStart } },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((sessions) => sessions.length),
      db.learningSession.aggregate({
        _sum: { duration: true },
      }),
      db.learningSession.count(),
      db.learningSession.aggregate({
        _avg: { duration: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      totalLearningTimeSeconds: totalLearningTime._sum.duration ?? 0,
      totalSessions,
      averageSessionDurationSeconds: Math.round(
        avgSessionDuration._avg.duration ?? 0,
      ),
    };
  }),
});
