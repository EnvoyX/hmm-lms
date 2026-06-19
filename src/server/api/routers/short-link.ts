import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { env } from '~/env';

const urlSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => {
    try {
      // Prepend https:// if missing scheme, to match existing logic
      const candidate = s.startsWith("http") ? s : `https://${s}`;
      const u = new URL(candidate);
      // Optional: restrict to http/https only
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Invalid URL format" });

export const shortLinkRouter = createTRPCRouter({
  create: protectedProcedure
  .input(
    z.object({
      originalUrl: urlSchema,
      slug: z.string().min(3).max(50).optional(),
      description: z.string().max(500).optional(),
      expiresAt: z.date().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const slug = input.slug ?? nanoid(8);

    const existing = await ctx.db.shortLink.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This slug is already taken",
      });
    }

    // Preserve the same normalization as before
    const originalUrl = input.originalUrl.startsWith("http")
      ? input.originalUrl
      : `https://${input.originalUrl}`;

    const shortLink = await ctx.db.shortLink.create({
      data: {
        slug,
        originalUrl,
        description: input.description,
        expiresAt: input.expiresAt,
        createdById: ctx.session.user.id,
      },
    });

    return shortLink;
  }),

  generateQRCode: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        size: z.number().min(128).max(1024).default(512),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shortLink = await ctx.db.shortLink.findUnique({
        where: { slug: input.slug },
      });

      if (!shortLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short link not found",
        });
      }

      if (
        shortLink.createdById !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to generate QR code for this link",
        });
      }

      const url = `${env.NEXT_PUBLIC_APP_URL}/s/${input.slug}`;

      try {
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
          width: input.size,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        return { qrCode: qrCodeDataUrl, url };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate QR code",
        });
      }
    }),

  checkSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.shortLink.count({
        where: { slug: input.slug },
      });
      return { available: count === 0 };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const shortLink = await ctx.db.shortLink.findUnique({
        where: { slug: input.slug },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!shortLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short link not found",
        });
      }

      if (!shortLink.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This link has been deactivated",
        });
      }

      if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This link has expired",
        });
      }

      return shortLink;
    }),

  getMyLinks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const links = await ctx.db.shortLink.findMany({
        where: { createdById: ctx.session.user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { clickLogs: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (links.length > input.limit) {
        const nextItem = links.pop();
        nextCursor = nextItem?.id;
      }

      return {
        links,
        nextCursor,
      };
    }),

  // Admin endpoints
  getAllLinks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this resource",
        });
      }

      const where = {
        ...(input.search && {
          OR: [
            { slug: { contains: input.search, mode: "insensitive" as const } },
            { originalUrl: { contains: input.search, mode: "insensitive" as const } },
            { description: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      };

      const links = await ctx.db.shortLink.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { clickLogs: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (links.length > input.limit) {
        const nextItem = links.pop();
        nextCursor = nextItem?.id;
      }

      return {
        links,
        nextCursor,
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "SUPERADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this resource",
      });
    }

    const [totalLinks, activeLinks, totalClicks, linksToday] = await Promise.all([
      ctx.db.shortLink.count(),
      ctx.db.shortLink.count({ where: { isActive: true } }),
      ctx.db.shortLink.aggregate({
        _sum: { clicks: true },
      }),
      ctx.db.shortLink.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalLinks,
      activeLinks,
      totalClicks: totalClicks._sum.clicks ?? 0,
      linksToday,
    };
  }),

  adminUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to perform this action",
        });
      }

      const updated = await ctx.db.shortLink.update({
        where: { id: input.id },
        data: {
          description: input.description,
          isActive: input.isActive,
          expiresAt: input.expiresAt,
        },
      });

      return updated;
    }),

  adminDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to perform this action",
        });
      }

      await ctx.db.shortLink.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getAnalytics: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN" || ctx.session.user.role === "SUPERADMIN";

      const shortLink = await ctx.db.shortLink.findUnique({
        where: {
          id: input.id,
          ...(isAdmin ? {} : { createdById: ctx.session.user.id }),
        },
        include: {
          clickLogs: {
            orderBy: { clickedAt: "desc" },
            take: 100,
          },
        },
      });

      if (!shortLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short link not found",
        });
      }

      return shortLink;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shortLink = await ctx.db.shortLink.findUnique({
        where: { id: input.id },
      });

      if (!shortLink || shortLink.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short link not found",
        });
      }

      const updated = await ctx.db.shortLink.update({
        where: { id: input.id },
        data: {
          description: input.description,
          isActive: input.isActive,
          expiresAt: input.expiresAt,
        },
      });

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const shortLink = await ctx.db.shortLink.findUnique({
        where: { id: input.id },
      });

      if (!shortLink || shortLink.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Short link not found",
        });
      }

      await ctx.db.shortLink.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
