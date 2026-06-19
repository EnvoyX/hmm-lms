import { z } from "zod";
import { Role } from "@prisma/client";

export const userIdSchema = z.object({
  id: z.string(),
});

export const updateUserRoleSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(Role),
});

export const editProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  faculty: z.string().max(200, "Faculty name is too long").optional(),
  program: z.string().max(200, "Program name is too long").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  nim: z.string().min(1),
  faculty: z.string().optional(),
  program: z.string().optional(),
  position: z.string().optional(),
  role: z.nativeEnum(Role),
});

export const deleteUserSchema = z.object({
  id: z.string(),
});

export const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  faculty: z.string().optional(),
});
