// ~/server/api/routers/dashboard.ts
import { z } from "zod";
import { formatDistanceToNow, startOfDay, subDays } from "date-fns";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const dashboardRouter = createTRPCRouter({
  // Quick stats for dashboard overview
  getQuickStats: adminProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SUPERADMIN"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const today = startOfDay(new Date());

    const [
      totalUsers,
      newUsersToday,
      totalCourses,
      activeCourses,
      todayActivity,
      activeUsersToday,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({
        where: { createdAt: { gte: today } },
      }),
      ctx.db.course.count(),
      ctx.db.course.count({ where: { isActive: true } }),
      ctx.db.learningSession.count({
        where: { date: { gte: today } },
      }),
      ctx.db.learningSession.groupBy({
        by: ["userId"],
        where: { date: { gte: today } },
      }),
    ]);

    // Calculate engagement (active users today / total users)
    const userEngagement = totalUsers > 0 
      ? Math.round((activeUsersToday.length / totalUsers) * 100)
      : 0;

    return {
      totalUsers,
      newUsersToday,
      totalCourses,
      activeCourses,
      todayActivity,
      userEngagement,
      courseCompletion: 75, // This would need actual calculation
      systemUptime: 99.9,
    };
  }),

  // Pending actions that require admin attention
  getPendingActions: adminProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SUPERADMIN"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const [
      pendingRSVPs,
      pendingPresence,
      expiredScholarships,
      inactiveUsers,
    ] = await Promise.all([
      ctx.db.eventRSVPResponse.count({
        where: { approvalStatus: "PENDING" },
      }),
      ctx.db.eventPresence.count({
        where: { status: "PENDING_APPROVAL" },
      }),
      ctx.db.scholarship.count({
        where: { 
          deadline: { lt: new Date() },
          createdAt: { gte: subDays(new Date(), 7) }
        },
      }),
      ctx.db.user.count({
        where: {
          learningSessions: {
            none: {
              date: { gte: subDays(new Date(), 30) },
            },
          },
        },
      }),
    ]);

    const items = [];

    if (pendingRSVPs > 0) {
      items.push({
        type: "RSVP Approval",
        title: `${pendingRSVPs} RSVP${pendingRSVPs > 1 ? 's' : ''} pending approval`,
        description: "Review and approve event RSVPs",
        priority: "high",
        link: "/admin/events?tab=rsvps",
        time: "Pending",
      });
    }

    if (pendingPresence > 0) {
      items.push({
        type: "Attendance",
        title: `${pendingPresence} attendance record${pendingPresence > 1 ? 's' : ''} pending`,
        description: "Review attendance submissions",
        priority: "high",
        link: "/admin/events?tab=attendance",
        time: "Pending",
      });
    }

    if (expiredScholarships > 0) {
      items.push({
        type: "Scholarships",
        title: `${expiredScholarships} scholarship${expiredScholarships > 1 ? 's' : ''} expired`,
        description: "Update or remove expired scholarships",
        priority: "medium",
        link: "/admin/scholarships",
        time: "Recently expired",
      });
    }

    if (inactiveUsers > 30) {
      items.push({
        type: "User Activity",
        title: `${inactiveUsers} inactive users`,
        description: "Users with no activity in 30 days",
        priority: "low",
        link: "/admin/users?filter=inactive",
        time: "Last 30 days",
      });
    }

    return {
      total: items.length,
      items,
    };
  }),

  // Recent activity feed
  getRecentActivity: adminProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SUPERADMIN"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const [recentUsers, recentSessions, recentAttempts] = await Promise.all([
      ctx.db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { name: true, createdAt: true },
      }),
      ctx.db.learningSession.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          user: { select: { name: true } },
          course: { select: { title: true } },
          createdAt: true,
        },
      }),
      ctx.db.userAttempt.findMany({
        take: 5,
        orderBy: { startedAt: "desc" },
        where: { isCompleted: true },
        select: {
          user: { select: { name: true } },
          tryout: { select: { title: true } },
          score: true,
          maxScore: true,
          startedAt: true,
        },
      }),
    ]);

    const activities = [
      ...recentUsers.map(user => ({
        description: `${user.name} joined the platform`,
        time: formatDistanceToNow(user.createdAt, { addSuffix: true }), // FIXED
        timestamp: user.createdAt,
        user: user.name,
      })),
      ...recentSessions.map(session => ({
        description: `${session.user.name} started learning ${session.course.title}`,
        time: formatDistanceToNow(session.createdAt, { addSuffix: true }), // FIXED
        timestamp: session.createdAt,
        user: session.user.name,
      })),
      ...recentAttempts.map(attempt => ({
        description: `${attempt.user.name} completed ${attempt.tryout.title} (${Math.round((attempt.score / attempt.maxScore) * 100)}%)`,
        time: formatDistanceToNow(attempt.startedAt, { addSuffix: true }), // FIXED
        timestamp: attempt.startedAt,
        user: attempt.user.name,
      })),
    ];

    // Sort by actual timestamp, not the formatted string
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }),

  // Upcoming events
  getUpcomingEvents: adminProcedure
    .input(z.object({ limit: z.number().optional().default(5) }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const events = await ctx.db.event.findMany({
        where: {
          start: { gte: new Date() },
        },
        orderBy: { start: "asc" },
        take: input.limit,
        select: {
          id: true,
          title: true,
          start: true,
          location: true,
          _count: {
            select: { rsvpResponses: true },
          },
        },
      });

      return events.map(event => ({
        ...event,
        start: event.start.toISOString(),
        rsvpCount: event._count.rsvpResponses,
      }));
    }),

  // System alerts
  getSystemAlerts: adminProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SUPERADMIN"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const alerts = [];

    // Check for high pending approvals
    const pendingApprovals = await ctx.db.eventRSVPResponse.count({
      where: { approvalStatus: "PENDING" },
    });

    if (pendingApprovals > 20) {
      alerts.push({
        title: "High Pending Approvals",
        message: `You have ${pendingApprovals} pending RSVP approvals that require attention.`,
        severity: "warning",
      });
    }

    return alerts;
  }),
});
