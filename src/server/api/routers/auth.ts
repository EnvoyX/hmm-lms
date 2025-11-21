import { TRPCError } from "@trpc/server";
import { hashPassword } from "~/lib/utils";
import { signUpSchema } from "~/lib/schema/auth";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import z from 'zod';

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { name, email, password, nim } = input;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Throw a specific tRPC error for existing email
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        nim,
      },
    });

    if (!newUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user. Please try again later.",
      });
    }

    return {
      success: true,
      message: "Registration successful. You can now sign in.",
      userId: newUser.id,
    };
  }),

   resetPasswordByAdmin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Optional: ensure only admins can use this
      if (ctx.session.user.role !== "SUPERADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      const user = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const newPassword = 'TempPass123';
      const hashedPassword = await hashPassword(newPassword);

      await db.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        newPassword, 
      };
    }),
});