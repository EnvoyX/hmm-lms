import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  scholarshipSchema,
  updateScholarshipSchema,
  scholarshipIdSchema,
} from "~/lib/schema/scholarship";

export const scholarshipRouter = createTRPCRouter({
  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    const data = await ctx.db.scholarship.create({
      data: {
        title: "Untitled Scholarship",
        description: "",
        provider: "",
        deadline: oneMonthLater,
        link: "",
        image: "",
        benefits: [],
        requirements: [],
        createdById: ctx.session.user.id,
      },
    });
    
    return data;
  }),


  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.scholarship.findMany({
      orderBy: { deadline: "asc" },
      include: { createdBy: { select: { name: true } } },
    });
  }),

  getById: adminProcedure
    .input(scholarshipIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.scholarship.findUnique({
        where: { id: input.id },
      });
    }),

  getPublicById: publicProcedure
    .input(scholarshipIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.scholarship.findUnique({
        where: { id: input.id },
      });
    }),

  create: adminProcedure
    .input(scholarshipSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scholarship.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: adminProcedure
    .input(updateScholarshipSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.scholarship.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(scholarshipIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scholarship.delete({
        where: { id: input.id },
      });
    }),
});
