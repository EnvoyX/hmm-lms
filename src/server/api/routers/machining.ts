import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  adminProcedure
} from "~/server/api/trpc";
import { db } from "~/server/db";
import z from 'zod';

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
  })
});