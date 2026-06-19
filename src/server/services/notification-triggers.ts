// src/server/services/notification-triggers.ts
import { db } from "~/server/db";
import {
  sendNotificationToMultiple,
  type NotificationPayload,
} from "~/lib/notifications"

export class NotificationTriggers {
  // Trigger when announcement is created
  static async onAnnouncementCreated(announcementId: string) {
    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
      include: {
        course: {
          include: {
            members: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) return;

    let subscriptions;
    let url = "/announcements";

    if (announcement.scope === "GLOBAL") {
      // Send to all users
      const allSubs = await db.pushSubscription.findMany();
      subscriptions = allSubs;
    } else if (announcement.course) {
      // Send to course members only
      subscriptions = announcement.course.members.flatMap(
        (m) => m.pushSubscriptions,
      );
      url = `/courses/${announcement.course.classCode}/announcements`;
    } else {
      return;
    }

    const payload: NotificationPayload = {
      title: "📢 New Announcement",
      body: announcement.title,
      url,
      type: "announcement",
      tag: `announcement-${announcement.id}`,
    };

    await sendNotificationToMultiple(
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
  }

  // Trigger when event is created
  static async onEventCreated(eventId: string) {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        course: {
          include: {
            members: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        },
        user: {
          include: {
            pushSubscriptions: true,
          },
        },
      },
    });

    if (!event) return;

    let subscriptions;
    let url = "/events";

    if (event.course) {
      subscriptions = event.course.members.flatMap((m) => m.pushSubscriptions);
      url = `/courses/${event.course.classCode}/events`;
    } else if (event.user) {
      subscriptions = event.user.pushSubscriptions;
    } else {
      // Global event - send to all
      const allSubs = await db.pushSubscription.findMany();
      subscriptions = allSubs;
    }

    const payload: NotificationPayload = {
      title: "📅 New Event",
      body: `${event.title} - ${new Date(event.start).toLocaleDateString()}`,
      url,
      type: "event",
      tag: `event-${event.id}`,
    };

    await sendNotificationToMultiple(
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
  }

  // Trigger when tryout is created
  static async onTryoutCreated(tryoutId: string) {
    const tryout = await db.tryout.findUnique({
      where: { id: tryoutId },
      include: {
        course: {
          include: {
            members: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        },
      },
    });

    if (!tryout) return;

    const subscriptions = tryout.course.members.flatMap(
      (m) => m.pushSubscriptions,
    );

    const payload: NotificationPayload = {
      title: "📝 New Tryout Available",
      body: tryout.title,
      url: `/tryouts/${tryout.id}`,
      type: "tryout",
      tag: `tryout-${tryout.id}`,
    };

    await sendNotificationToMultiple(
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
  }

  // Trigger when scholarship is posted
  static async onScholarshipCreated(scholarshipId: string) {
    const scholarship = await db.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) return;

    // Send to all users
    const subscriptions = await db.pushSubscription.findMany();

    const payload: NotificationPayload = {
      title: "🎓 New Scholarship Opportunity",
      body: `${scholarship.title} - Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`,
      url: `/scholarships/${scholarship.id}`,
      type: "scholarship",
      tag: `scholarship-${scholarship.id}`,
    };

    await sendNotificationToMultiple(
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
  }

  // Trigger when job vacancy is posted
  static async onJobVacancyCreated(jobId: string) {
    const job = await db.jobVacancy.findUnique({
      where: { id: jobId },
    });

    if (!job) return;

    // Send to all users
    const subscriptions = await db.pushSubscription.findMany();

    const payload: NotificationPayload = {
      title: "💼 New Job Opportunity",
      body: `${job.position} at ${job.company}`,
      url: `/jobs/${job.id}`,
      type: "job",
      tag: `job-${job.id}`,
    };

    await sendNotificationToMultiple(
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
  }

  static async onCourseCreated(courseId: string) {
    const course = await db.course.findUnique({
      where: { id: courseId },
    });
    if (!course) return;

    // Send to all users
    const subscriptions = await db.pushSubscription.findMany();
    const payload: NotificationPayload = {
      title: "📚 New Course Available",
      body: course.title,
      url: `/courses/${course.classCode}`,
      type: "course",
      tag: `course-${course.id}`,
    };
    await sendNotificationToMultiple(
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
  }
}
