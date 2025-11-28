import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { hashPassword } from "~/lib/utils";
import { signUpSchema } from "~/lib/schema/auth";
import { sendPasswordResetEmail } from "~/server/services/email";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import z from "zod";

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

      const newPassword = "TempPass123";
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

  // Request password reset - sends email to user's alternative email
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email()
          .endsWith(
            "@mahasiswa.itb.ac.id",
            "Only ITB student emails are allowed.",
          ),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (!user?.alternativeEmail) {
        return {
          success: true,
          message:
            "If an account with that email exists and has a recovery email set, you will receive a password reset link.",
        };
      }

      // Delete any existing reset tokens for this user
      await db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create a new reset token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // Send password reset email
      const resetLink = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

      await sendPasswordResetEmail({
        to: user.alternativeEmail,
        userName: user.name,
        resetLink,
      });

      return {
        success: true,
        message:
          "If an account with that email exists and has a recovery email set, you will receive a password reset link.",
      };
    }),

  // Verify reset token
  verifyResetToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const resetToken = await db.passwordResetToken.findUnique({
        where: { token: input.token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token.",
        });
      }

      if (resetToken.expiresAt < new Date()) {
        // Clean up expired token
        await db.passwordResetToken.delete({
          where: { id: resetToken.id },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired. Please request a new one.",
        });
      }

      return {
        valid: true,
        email: resetToken.user.email,
        userName: resetToken.user.name,
      };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z
        .object({
          token: z.string(),
          password: z
            .string()
            .min(8, "Password must be at least 8 characters long."),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords must match",
          path: ["confirmPassword"],
        }),
    )
    .mutation(async ({ input }) => {
      const resetToken = await db.passwordResetToken.findUnique({
        where: { token: input.token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token.",
        });
      }

      if (resetToken.expiresAt < new Date()) {
        // Clean up expired token
        await db.passwordResetToken.delete({
          where: { id: resetToken.id },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired. Please request a new one.",
        });
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(input.password);

      await db.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Delete the used token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return {
        success: true,
        message:
          "Password has been reset successfully. You can now sign in with your new password.",
      };
    }),

  // Update alternative email (for logged-in users)
  updateAlternativeEmail: protectedProcedure
    .input(
      z.object({
        alternativeEmail: z
          .string()
          .email("Invalid email address.")
          .refine(
            (email) =>
              !email.endsWith("@itb.ac.id") &&
              !email.endsWith("@mahasiswa.itb.ac.id"),
            {
              message:
                "Please use a personal email (Gmail, etc.), not an ITB email.",
            },
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.user.update({
        where: { id: ctx.session.user.id },
        data: { alternativeEmail: input.alternativeEmail },
      });

      return {
        success: true,
        message: "Recovery email has been updated successfully.",
      };
    }),

  // Get current user's alternative email
  getAlternativeEmail: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { alternativeEmail: true },
    });

    return {
      alternativeEmail: user?.alternativeEmail ?? null,
    };
  }),
});
