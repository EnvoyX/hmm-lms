import { z } from "zod";
import { AnnouncementScope } from "@prisma/client";

export const announcementSchema_ = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  scope: z.nativeEnum(AnnouncementScope),
  images: z.array(z.string()).default([]),
  // courseId is only required if the scope is 'COURSE'
  courseId: z.string().cuid().optional(),
});

export const announcementSchema = announcementSchema_.refine(
    (data) => {
      if (data.scope === "COURSE" && !data.courseId) {
        return false;
      }
      return true;
    },
    {
      message: "Course ID is required for course-specific announcements",
      path: ["courseId"],
    },
  );

export const updateAnnouncementSchema = announcementSchema_.extend({
  id: z.string().cuid(),
});

export const announcementIdSchema = z.object({
  id: z.string().cuid(),
});
