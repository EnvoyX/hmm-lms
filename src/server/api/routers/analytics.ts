// ~/server/api/routers/analytics.ts (UPDATED)

import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const timeRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const analyticsRouter = createTRPCRouter({
  // Overview stats (ENHANCED)
  getOverviewStats: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;
      
      // Calculate previous period for comparison
      const periodDuration = to.getTime() - from.getTime();
      const previousFrom = new Date(from.getTime() - periodDuration);
      const previousTo = from;

      const [
        totalUsers,
        newUsers,
        previousNewUsers,
        totalCourses,
        activeCourses,
        totalTryouts,
        activeTryouts,
        totalResources,
        totalEvents,
        upcomingEvents,
        totalAnnouncements,
        totalScholarships,
        activeScholarships,
        totalJobVacancies,
        activeJobVacancies,
        totalFormSubmissions,
        totalRSVPs,
        totalPresenceRecords,
        averageTestimonialRating,
      ] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { createdAt: { gte: from, lte: to } } }),
        ctx.db.user.count({ where: { createdAt: { gte: previousFrom, lte: previousTo } } }),
        ctx.db.course.count(),
        ctx.db.course.count({ where: { isActive: true } }),
        ctx.db.tryout.count(),
        ctx.db.tryout.count({ where: { isActive: true } }),
        ctx.db.resource.count({ where: { isActive: true } }),
        ctx.db.event.count({ where: { start: { gte: from, lte: to } } }),
        ctx.db.event.count({ where: { start: { gte: new Date(), lte: to } } }),
        ctx.db.announcement.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.scholarship.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.scholarship.count({
          where: { deadline: { gte: new Date() } },
        }),
        ctx.db.jobVacancy.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.jobVacancy.count({
          where: { isActive: true },
        }),
        ctx.db.formSubmission.count({
          where: { submittedAt: { gte: from, lte: to } },
        }),
        ctx.db.eventRSVPResponse.count({
          where: { respondedAt: { gte: from, lte: to } },
        }),
        ctx.db.eventPresence.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.courseTestimonial.aggregate({
          _avg: { rating: true },
          where: { createdAt: { gte: from, lte: to } },
        }),
      ]);

      const userGrowthRate = previousNewUsers > 0 
        ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 
        : 0;

      return {
        totalUsers,
        newUsers,
        userGrowthRate: Math.round(userGrowthRate * 10) / 10,
        totalCourses,
        activeCourses,
        totalTryouts,
        activeTryouts,
        totalResources,
        totalEvents,
        upcomingEvents,
        totalAnnouncements,
        totalScholarships,
        activeScholarships,
        totalJobVacancies,
        activeJobVacancies,
        totalFormSubmissions,
        totalRSVPs,
        totalPresenceRecords,
        averageTestimonialRating: averageTestimonialRating._avg.rating ?? 0,
      };
    }),

  // User activity over time (EXISTING - KEEP AS IS)
  getUserActivity: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;
      const userRegistrations = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: from, lte: to } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      });

      const learningSessions = await ctx.db.learningSession.groupBy({
        by: ["date"],
        where: { date: { gte: from, lte: to } },
        _count: { id: true },
        _sum: { duration: true },
        orderBy: { date: "asc" },
      });

      return {
        userRegistrations: userRegistrations.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
        learningSessions: learningSessions.map((item) => ({
          ...item,
          date: item.date.toISOString(),
        })),
      };
    }),

  // NEW: User Demographics
  getUserDemographics: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const [facultyDistribution, roleDistribution, programDistribution] = 
        await Promise.all([
          ctx.db.user.groupBy({
            by: ["faculty"],
            where: { 
              createdAt: { gte: from, lte: to },
              faculty: { not: null }
            },
            _count: { id: true },
          }),
          ctx.db.user.groupBy({
            by: ["role"],
            where: { createdAt: { gte: from, lte: to } },
            _count: { id: true },
          }),
          ctx.db.user.groupBy({
            by: ["program"],
            where: { 
              createdAt: { gte: from, lte: to },
              program: { not: null }
            },
            _count: { id: true },
          }),
        ]);

      return {
        facultyDistribution: facultyDistribution.map(item => ({
          name: item.faculty ?? "Unknown",
          value: item._count.id,
        })),
        roleDistribution: roleDistribution.map(item => ({
          name: item.role,
          value: item._count.id,
        })),
        programDistribution: programDistribution.map(item => ({
          name: item.program ?? "Unknown",
          value: item._count.id,
        })),
      };
    }),

  // Tryout performance (EXISTING - KEEP AS IS)
  getTryoutPerformance: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const tryoutStats = await ctx.db.tryout.findMany({
        select: {
          id: true,
          title: true,
          attempts: {
            where: {
              startedAt: {
                gte: from,
                lte: to,
              },
              isCompleted: true,
            },
            select: {
              score: true,
              maxScore: true,
            },
          },
        },
      });

      const tryoutPerformance = tryoutStats.map((tryout) => {
        const attempts = tryout.attempts;
        const totalAttempts = attempts.length;
        const avgScore =
          totalAttempts > 0
            ? attempts.reduce(
                (sum, attempt) =>
                  sum + (attempt.score / attempt.maxScore) * 100,
                0,
              ) / totalAttempts
            : 0;

        return {
          id: tryout.id,
          title: tryout.title,
          totalAttempts,
          averageScore: Math.round(avgScore * 100) / 100,
        };
      });

      const attemptsOverTime = await ctx.db.userAttempt.groupBy({
        by: ["startedAt"],
        where: { startedAt: { gte: from, lte: to }, isCompleted: true },
        _count: { id: true },
        _avg: { score: true },
        orderBy: { startedAt: "asc" },
      });

      return {
        tryoutPerformance,
        attemptsOverTime: attemptsOverTime.map((item) => ({
          ...item,
          startedAt: item.startedAt.toISOString(),
        })),
      };
    }),

// NEW: Tryout Insights (FIXED)
getTryoutInsights: adminProcedure
  .input(timeRangeSchema)
  .query(async ({ ctx, input }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SUPERADMIN"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const { from, to } = input;

    const [totalAttempts, completedAttempts, averageAttempts, topPerformers] = 
      await Promise.all([
        // Count total attempts
        ctx.db.userAttempt.count({
          where: { startedAt: { gte: from, lte: to } },
        }),
        // Count completed attempts
        ctx.db.userAttempt.count({
          where: { 
            startedAt: { gte: from, lte: to },
            isCompleted: true,
          },
        }),
        // Group by user and tryout to calculate average attempts
        ctx.db.userAttempt.groupBy({
          by: ["userId", "tryoutId"],
          where: { startedAt: { gte: from, lte: to } },
          _count: { id: true },
        }),
        // Get top performers
        ctx.db.userAttempt.findMany({
          where: {
            startedAt: { gte: from, lte: to },
            isCompleted: true,
          },
          select: {
            score: true,
            maxScore: true,
            user: {
              select: {
                name: true,
                nim: true,
              },
            },
            tryout: {
              select: {
                title: true,
              },
            },
          },
          orderBy: {
            score: "desc",
          },
          take: 10,
        }),
      ]);

    const completionPercentage = totalAttempts > 0
      ? (completedAttempts / totalAttempts) * 100
      : 0;

    const avgAttemptsPerUser = averageAttempts.length > 0
      ? averageAttempts.reduce((sum, item) => sum + item._count.id, 0) / 
        new Set(averageAttempts.map(item => item.userId)).size
      : 0;

    return {
      completionRate: Math.round(completionPercentage * 10) / 10,
      averageAttemptsPerUser: Math.round(avgAttemptsPerUser * 10) / 10,
      topPerformers: topPerformers.map(attempt => ({
        userName: attempt.user.name,
        nim: attempt.user.nim,
        tryoutTitle: attempt.tryout.title,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: Math.round((attempt.score / attempt.maxScore) * 100 * 10) / 10,
      })),
    };
  }),


  // Resource analytics (EXISTING - KEEP AS IS)
  getResourceAnalytics: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const resources = await ctx.db.resource.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          type: true,
          category: true,
          createdAt: true,
          accessLogs: {
            where: {
              accessedAt: {
                gte: from,
                lte: to,
              },
            },
            select: {
              action: true,
            },
          },
        },
      });

      const resourceStatsRaw = resources.map((resource) => {
        const views = resource.accessLogs.filter(
          (log) => log.action === "VIEW",
        ).length;
        const downloads = resource.accessLogs.filter(
          (log) => log.action === "DOWNLOAD",
        ).length;

        return {
          id: resource.id,
          title: resource.title,
          type: resource.type,
          category: resource.category,
          createdAt: resource.createdAt,
          views,
          downloads,
        };
      });

      const accessOverTime = await ctx.db.resourceAccess.groupBy({
        by: ["accessedAt", "action"],
        where: { accessedAt: { gte: from, lte: to } },
        _count: { id: true },
        orderBy: { accessedAt: "asc" },
      });

      return {
        resourceStats: resourceStatsRaw.map((resource) => ({
          ...resource,
          createdAt: resource.createdAt.toISOString(),
        })),
        accessOverTime: accessOverTime.map((item) => ({
          ...item,
          accessedAt: item.accessedAt.toISOString(),
        })),
      };
    }),

  // NEW: Resource Category Breakdown
  getResourceCategoryBreakdown: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const [categoryBreakdown, typeBreakdown, mostActiveUsers] = await Promise.all([
        ctx.db.resource.groupBy({
          by: ["category"],
          where: { 
            isActive: true,
            category: { not: null }
          },
          _count: { id: true },
        }),
        ctx.db.resource.groupBy({
          by: ["type"],
          where: { isActive: true },
          _count: { id: true },
        }),
        ctx.db.resourceAccess.groupBy({
          by: ["userId"],
          where: { accessedAt: { gte: from, lte: to } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
      ]);

      const usersWithDetails = await ctx.db.user.findMany({
        where: {
          id: { in: mostActiveUsers.map(item => item.userId) },
        },
        select: {
          id: true,
          name: true,
          nim: true,
        },
      });

      return {
        categoryBreakdown: categoryBreakdown.map(item => ({
          name: item.category ?? "Other",
          value: item._count.id,
        })),
        typeBreakdown: typeBreakdown.map(item => ({
          name: item.type,
          value: item._count.id,
        })),
        mostActiveUsers: mostActiveUsers.map(item => {
          const user = usersWithDetails.find(u => u.id === item.userId);
          return {
            userId: item.userId,
            userName: user?.name ?? "Unknown",
            nim: user?.nim ?? "N/A",
            accessCount: item._count.id,
          };
        }),
      };
    }),

  // Course analytics (EXISTING - KEEP AS IS)
  getCourseAnalytics: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const courseStats = await ctx.db.course.findMany({
        select: {
          id: true,
          title: true,
          classCode: true,
          createdAt: true,
          _count: {
            select: { members: true },
          },
          learningSession: {
            where: {
              date: {
                gte: from,
                lte: to,
              },
            },
            select: {
              duration: true,
              userId: true,
            },
          },
        },
      });

      const courseAnalyticsRaw = courseStats.map((course) => {
        const totalMembers = course._count.members;
        const activeLearners = new Set(
          course.learningSession.map((session) => session.userId),
        ).size;
        const totalDuration = course.learningSession.reduce(
          (sum, session) => sum + session.duration,
          0,
        );
        const avgDurationPerMember =
          totalMembers > 0 ? totalDuration / totalMembers : 0;

        return {
          id: course.id,
          title: course.title,
          classCode: course.classCode,
          totalMembers,
          activeLearners,
          engagementRate:
            totalMembers > 0 ? (activeLearners / totalMembers) * 100 : 0,
          avgDurationPerMember: Math.round(avgDurationPerMember),
          totalDuration,
        };
      });

      return courseAnalyticsRaw.map((course) => ({
        ...course,
        createdAt: courseStats
          .find((c) => c.id === course.id)!
          .createdAt.toISOString(),
      }));
    }),

  // NEW: Event Analytics
  getEventAnalytics: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const [eventStats, rsvpStats, attendanceStats] = await Promise.all([
        ctx.db.event.findMany({
          where: { start: { gte: from, lte: to } },
          select: {
            id: true,
            title: true,
            start: true,
            eventMode: true,
            _count: {
              select: {
                rsvpResponses: true,
                presenceRecords: true,
              },
            },
            rsvpResponses: {
              select: {
                status: true,
                approvalStatus: true,
              },
            },
            presenceRecords: {
              select: {
                status: true,
              },
            },
          },
        }),
        ctx.db.eventRSVPResponse.groupBy({
          by: ["status"],
          where: { respondedAt: { gte: from, lte: to } },
          _count: { id: true },
        }),
        ctx.db.eventPresence.groupBy({
          by: ["status"],
          where: { createdAt: { gte: from, lte: to } },
          _count: { id: true },
        }),
      ]);

      const eventDetails = eventStats.map(event => {
        const yesRSVPs = event.rsvpResponses.filter(r => r.status === "YES").length;
        const presentCount = event.presenceRecords.filter(p => p.status === "PRESENT").length;
        const lateCount = event.presenceRecords.filter(p => p.status === "LATE").length;

        return {
          id: event.id,
          title: event.title,
          start: event.start.toISOString(),
          eventMode: event.eventMode,
          totalRSVPs: event._count.rsvpResponses,
          yesRSVPs,
          totalPresence: event._count.presenceRecords,
          presentCount,
          lateCount,
          attendanceRate: yesRSVPs > 0 ? Math.round((presentCount / yesRSVPs) * 100 * 10) / 10 : 0,
        };
      });

      return {
        eventDetails,
        rsvpStatusBreakdown: rsvpStats.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
        attendanceStatusBreakdown: attendanceStats.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
      };
    }),

  // NEW: Form Analytics
  getFormAnalytics: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const forms = await ctx.db.form.findMany({
        select: {
          id: true,
          title: true,
          isPublished: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              submissions: true,
            },
          },
          submissions: {
            where: {
              submittedAt: { gte: from, lte: to },
            },
            select: {
              submittedAt: true,
            },
          },
        },
      });

      const submissionsOverTime = await ctx.db.formSubmission.groupBy({
        by: ["submittedAt"],
        where: { submittedAt: { gte: from, lte: to } },
        _count: { id: true },
        orderBy: { submittedAt: "asc" },
      });

      return {
        formStats: forms.map(form => ({
          id: form.id,
          title: form.title,
          isPublished: form.isPublished,
          isActive: form.isActive,
          totalSubmissions: form._count.submissions,
          recentSubmissions: form.submissions.length,
        })),
        submissionsOverTime: submissionsOverTime.map(item => ({
          date: item.submittedAt.toISOString(),
          value: item._count.id,
        })),
      };
    }),

  // NEW: Platform Health Metrics
  getPlatformHealth: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const [
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        averageSessionDuration,
        retentionData,
      ] = await Promise.all([
        ctx.db.learningSession.groupBy({
          by: ["userId"],
          where: { 
            date: { 
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              lte: new Date()
            } 
          },
          _count: { id: true },
        }),
        ctx.db.learningSession.groupBy({
          by: ["userId"],
          where: { 
            date: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              lte: new Date()
            } 
          },
          _count: { id: true },
        }),
        ctx.db.learningSession.groupBy({
          by: ["userId"],
          where: { 
            date: { 
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              lte: new Date()
            } 
          },
          _count: { id: true },
        }),
        ctx.db.learningSession.aggregate({
          where: { date: { gte: from, lte: to } },
          _avg: { duration: true },
        }),
        ctx.db.user.findMany({
          where: { createdAt: { gte: from, lte: to } },
          select: {
            id: true,
            createdAt: true,
            learningSessions: {
              select: {
                date: true,
              },
            },
          },
        }),
      ]);

      // Calculate stickiness (DAU/MAU ratio)
      const stickiness = monthlyActiveUsers.length > 0
        ? (dailyActiveUsers.length / monthlyActiveUsers.length) * 100
        : 0;

      // Calculate retention rate (users who returned after signup)
      const returnedUsers = retentionData.filter(user => 
        user.learningSessions.some(session => 
          session.date.getTime() > user.createdAt.getTime() + (24 * 60 * 60 * 1000)
        )
      ).length;
      const retentionRate = retentionData.length > 0
        ? (returnedUsers / retentionData.length) * 100
        : 0;

      return {
        dailyActiveUsers: dailyActiveUsers.length,
        weeklyActiveUsers: weeklyActiveUsers.length,
        monthlyActiveUsers: monthlyActiveUsers.length,
        stickiness: Math.round(stickiness * 10) / 10,
        averageSessionDuration: Math.round(averageSessionDuration._avg.duration ?? 0),
        retentionRate: Math.round(retentionRate * 10) / 10,
      };
    }),
});
