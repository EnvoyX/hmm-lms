import { authRouter } from "~/server/api/routers/auth";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { trackingRouter } from './routers/learning-tracker';
import { eventRouter } from './routers/event';
import { announcementRouter } from './routers/announcement';
import { scholarshipRouter } from './routers/scholarship';
import { courseRouter } from './routers/course';
import { tryoutRouter } from './routers/tryout';
import { userRouter } from './routers/user';
import { pushRouter } from './routers/push';
import { jobVacancyRouter } from './routers/loker';
import { databaseRouter } from './routers/database';
import { analyticsRouter } from './routers/analytics';
import { notificationsRouter } from './routers/notifications';
import { formRouter } from './routers/forms';
import { dashboardRouter } from './routers/dashboard';
import { studentDashboardRouter } from './routers/student/dashboard';
import { shortLinkRouter } from './routers/short-link';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  lessonTracker: trackingRouter,
  event: eventRouter,
  announcement: announcementRouter,
  scholarship: scholarshipRouter,
  course: courseRouter,
  tryout: tryoutRouter,
  user: userRouter,
  push: pushRouter,
  loker: jobVacancyRouter,
  database: databaseRouter,
  analytic: analyticsRouter,
  notification: notificationsRouter,
  form: formRouter,
  dashboard: dashboardRouter,
  studentDashboard: studentDashboardRouter,
  shortLink: shortLinkRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
