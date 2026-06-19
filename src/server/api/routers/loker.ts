// ~/server/api/routers/job-vacancy.ts
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const createJobVacancySchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  eligibility: z.string().min(1, "Eligibility is required"),
  streams: z.array(z.string()).min(1, "At least one stream is required"),
  overview: z.string().min(1, "Overview is required"),
  timeline: z.string().min(1, "Timeline is required"),
  applyLink: z.string().url("Valid URL is required"),
  salaryLabel: z.string().max(120).optional(),
  seniority: z.string().max(64).optional(),
  employmentType: z.string().max(64).optional(),
});

const updateJobVacancySchema = createJobVacancySchema.partial().extend({
  id: z.string(),
});

export const jobVacancyRouter = createTRPCRouter({
  // Public procedures
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        streams: z.array(z.string()).optional(),
        location: z.string().optional(),
        seniority: z.string().optional(),
        employmentType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        search,
        streams,
        location,
        seniority,
        employmentType,
      } = input;

      const where = {
        isActive: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { position: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(streams &&
          streams.length > 0 && {
            streams: {
              hasSome: streams,
            },
          }),
        ...(location && {
          position: { contains: location, mode: "insensitive" as const },
        }),
        ...(seniority && {
          seniority: { equals: seniority, mode: "insensitive" as const },
        }),
        ...(employmentType && {
          employmentType: {
            equals: employmentType,
            mode: "insensitive" as const,
          },
        }),
      };

      const jobVacancies = await ctx.db.jobVacancy.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (jobVacancies.length > limit) {
        const nextItem = jobVacancies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        jobVacancies,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const jobVacancy = await ctx.db.jobVacancy.findUnique({
        where: { id: input.id, isActive: true },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!jobVacancy) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job vacancy not found",
        });
      }

      return jobVacancy;
    }),

  // Admin procedures
  getAllAdmin: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        includeInactive: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { limit, cursor, search, includeInactive } = input;

      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { position: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(!includeInactive && { isActive: true }),
      };

      const jobVacancies = await ctx.db.jobVacancy.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (jobVacancies.length > limit) {
        const nextItem = jobVacancies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        jobVacancies,
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(createJobVacancySchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.jobVacancy.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(updateJobVacancySchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { id, ...data } = input;

      return ctx.db.jobVacancy.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.jobVacancy.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const jobVacancy = await ctx.db.jobVacancy.findUnique({
        where: { id: input.id },
        select: { isActive: true },
      });

      if (!jobVacancy) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job vacancy not found",
        });
      }

      return ctx.db.jobVacancy.update({
        where: { id: input.id },
        data: { isActive: !jobVacancy.isActive },
      });
    }),
});
