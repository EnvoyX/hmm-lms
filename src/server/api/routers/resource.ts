// ~/server/api/routers/resource.ts
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { AttachableType, ResourceCategory, ResourceType, LinkSource } from "@prisma/client";

export const resourceRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().nullable(),
        type: z.nativeEnum(ResourceType),
        attachableId: z.string().cuid(),
        attachableType: z.nativeEnum(AttachableType),
        category: z.nativeEnum(ResourceCategory).nullable(),
        link: z.object({ url: z.string().url(), source: z.nativeEnum(LinkSource) }).optional(),
        file: z.object({ filename: z.string(), key: z.string(), mimeType: z.string(), size: z.number() }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { link, file, ...resourceData } = input;

      const resource = await ctx.db.resource.create({
        data: {
          ...resourceData,
          uploadedById: ctx.session.user.id,
          link: link ? { create: link } : undefined,
          attachment: file ? { create: file } : undefined,
        },
      });

      return resource;
    }),

  // Add a dedicated image upload endpoint if needed, but the /api/upload route is fine.
  // This is a tRPC way of doing it if you prefer.
  uploadImage: adminProcedure
    .input(z.object({
      imageUrls: z.array(z.string().url()),
      questionId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // This mutation would be used to update a question with new image URLs
      return ctx.db.question.update({
        where: { id: input.questionId },
        data: {
          images: input.imageUrls,
        },
      });
    }),

  deleteResource: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ }) => {

      return { message: "Resource deletion endpoint." };
    }),

  // Add more resource-related procedures here (e.g., get, update, list)
});