import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import z from "zod";

export const machiningRouter = createTRPCRouter({
  createBatch: adminProcedure.input(z.object({
    batch: z.string(),
  })).mutation(async ({ input }) => {
    const { batch } = input;

    if (!batch || batch.trim() === '') {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Batch number is required.",
      });
    }

    await db.machining.create({
      data: {
        currentBatch: batch,
      },
    });

    return {
      success: true,
      message: `Batch (${batch}) created successfully.`,
    };
  }),

  updateBatch: adminProcedure.input(z.object({
    id: z.string(),
    batch: z.string()
  })).mutation(async ({input}) => {
    const {batch, id} = input;

    if (!batch || batch.trim() === '') {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Batch number is required.",
      });
    }

    if (!id || id.trim() === '') {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Batch ID is required.",
      });
    }

    await db.machining.update({
      where: {
        id,
      },
      data: {
        currentBatch: batch,
      },
    });

    return {
      success: true,
      message: `Batch (${batch}) updated successfully.`,
    };
  }),
  getBatch: adminProcedure.query(async () => {
    const batch = await db.machining.findFirst();
    return {
      success: true,
      data: batch || null,
    };
  }),

  // Assignments are Forms with type = MACHINING
  getAssignments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const forms = await db.form.findMany({
      where: {
        type: "MACHINING",
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        submissions: {
          where: { submittedBy: userId },
          select: { id: true, submittedAt: true },
        },
        _count: {
          select: { submissions: true, questions: true },
        },
      },
    });

    return forms.map((form) => ({
      ...form,
      hasSubmitted: form.submissions.length > 0,
      submittedAt: form.submissions[0]?.submittedAt ?? null,
    }));
  }),

  getAssignmentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const form = await db.form.findFirst({
        where: { id: input.id, type: "MACHINING" },
        include: {
          creator: {
            select: { id: true, name: true, image: true },
          },
          questions: {
            orderBy: { order: "asc" },
          },
          submissions: {
            where: { submittedBy: userId },
            orderBy: { submittedAt: "desc" },
          },
          _count: {
            select: { submissions: true, questions: true },
          },
        },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found.",
        });
      }

      return {
        ...form,
        hasSubmitted: form.submissions.length > 0,
      };
    }),
});