import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  classCode: z
    .string()
    .min(6, "Class code must be at least 6 characters")
    .max(10),
});

export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().cuid(),
});

export const courseIdSchema = z.object({
  id: z.string().cuid(),
});

export const joinCourseSchema = z.object({
  classCode: z.string(),
});
