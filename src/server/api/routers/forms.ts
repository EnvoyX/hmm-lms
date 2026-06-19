import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  createFormSchema,
  updateFormSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitFormSchema,
} from "~/lib/types/forms";
import { FormType } from "@prisma/client";

export const formRouter = createTRPCRouter({
  // Form management
  create: protectedProcedure
    .input(createFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.form.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(updateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if user owns the form
      const existingForm = await ctx.db.form.findUnique({
        where: { id },
        select: { createdBy: true },
      });

      if (!existingForm || existingForm.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own forms",
        });
      }

      return ctx.db.form.update({
        where: { id },
        data,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the form
      const existingForm = await ctx.db.form.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      });

      if (!existingForm || existingForm.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own forms",
        });
      }

      return ctx.db.form.delete({
        where: { id: input.id },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // If form is not published, only allow creator to view
      if (!form.isPublished && form.createdBy !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not published",
        });
      }

      return form;
    }),

  getMyForms: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const forms = await ctx.db.form.findMany({
        where: { createdBy: ctx.session.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (forms.length > limit) {
        const nextItem = forms.pop();
        nextCursor = nextItem?.id;
      }

      return {
        forms,
        nextCursor,
      };
    }),



  getHotlineForms: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const forms = await ctx.db.form.findMany({
        where: {
          type: "HOTLINE",
          isActive: true,
          isPublished: true,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (forms.length > limit) {
        const nextItem = forms.pop();
        nextCursor = nextItem?.id;
      }

      return {
        forms,
        nextCursor,
      };
    }),

  // Question management
  createQuestion: protectedProcedure
    .input(createQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the form
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (!form || form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only add questions to your own forms",
        });
      }

      return ctx.db.formQuestion.create({
        data: input,
      });
    }),

  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if user owns the form
      const question = await ctx.db.formQuestion.findUnique({
        where: { id },
        include: { form: true },
      });

      if (!question || question.form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit questions in your own forms",
        });
      }

      return ctx.db.formQuestion.update({
        where: { id },
        data,
      });
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the form
      const question = await ctx.db.formQuestion.findUnique({
        where: { id: input.id },
        include: { form: true },
      });

      if (!question || question.form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete questions in your own forms",
        });
      }

      return ctx.db.formQuestion.delete({
        where: { id: input.id },
      });
    }),

  reorderQuestions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        questionIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the form
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (!form || form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only reorder questions in your own forms",
        });
      }

      // Update order for each question
      const updatePromises = input.questionIds.map((questionId, index) =>
        ctx.db.formQuestion.update({
          where: { id: questionId },
          data: { order: index },
        }),
      );

      await Promise.all(updatePromises);

      return { success: true };
    }),

  // Form submission
  submit: publicProcedure
    .input(submitFormSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        include: { questions: true },
      });

      if (!form || !form.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or inactive",
        });
      }

      if (form.requireAuth && !ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required for this form",
        });
      }

      // Check for existing submissions if not allowed
      if (!form.allowMultipleSubmissions && ctx.session?.user) {
        const existingSubmission = await ctx.db.formSubmission.findFirst({
          where: {
            formId: input.formId,
            submittedBy: ctx.session.user.id,
          },
        });

        if (existingSubmission) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Multiple submissions not allowed for this form",
          });
        }
      }

      // Create submission with answers
      return ctx.db.formSubmission.create({
        data: {
          formId: input.formId,
          submittedBy: ctx.session?.user?.id,
          answers: {
            create: input.answers,
          },
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      });
    }),

  // Get form submissions (for form creators)
  getSubmissions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user owns the form
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (!form || form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view submissions for your own forms",
        });
      }

      const { limit, cursor } = input;

      const submissions = await ctx.db.formSubmission.findMany({
        where: { formId: input.formId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { submittedAt: "desc" },
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
            },
          },
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (submissions.length > limit) {
        const nextItem = submissions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        submissions,
        nextCursor,
      };
    }),

  // Helper endpoints for dropdowns
  getUserNames: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: input.search
          ? {
              name: {
                contains: input.search,
                mode: "insensitive",
              },
            }
          : undefined,
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 50,
        orderBy: { name: "asc" },
      });
    }),

  getUserNims: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          nim: { not: "" },
          ...(input.search
            ? {
                OR: [
                  { nim: { contains: input.search, mode: "insensitive" } },
                  { name: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          nim: true,
        },
        take: 50,
        orderBy: { nim: "asc" },
      });
    }),

  getCourses: publicProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.course.findMany({
        where: {
          isActive: true,
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  {
                    classCode: { contains: input.search, mode: "insensitive" },
                  },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          classCode: true,
        },
        take: 50,
        orderBy: { title: "asc" },
      });
    }),

  getEvents: publicProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: {
          ...(input.search
            ? {
                title: { contains: input.search, mode: "insensitive" },
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          start: true,
          location: true,
        },
        take: 50,
        orderBy: { start: "desc" },
      });
    }),

  getUserSubmissionStatus: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingSubmission = await ctx.db.formSubmission.findFirst({
        where: {
          formId: input.formId,
          submittedBy: ctx.session.user.id,
        },
        select: {
          id: true,
          submittedAt: true,
        },
      });
      return existingSubmission;
    }),

  updatePublish: adminProcedure
    .input(z.object({ formId: z.string(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const published = await ctx.db.form.update({
        where: {
          id: input.formId,
        },
        data: {
          isPublished: input.isPublished,
        },
      });

      return published;
    }),

  duplicate: adminProcedure
    .input(z.object({ formId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingForm = await ctx.db.form.findUnique({
        where: { id: input.formId },
        include: { questions: true },
      });

      if (!existingForm || existingForm.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only duplicate your own forms",
        });
      }

      // Create new form
      const newForm = await ctx.db.form.create({
        data: {
          title: `${existingForm.title} (Copy)`,
          description: existingForm.description,
          isPublished: false, // reset publish state for safety
          isActive: true,
          createdBy: ctx.session.user.id,
          allowMultipleSubmissions: existingForm.allowMultipleSubmissions,
          requireAuth: existingForm.requireAuth,
          showProgressBar: existingForm.showProgressBar,
          collectEmail: existingForm.collectEmail,
          questions: {
            create: existingForm.questions.map((q) => ({
              title: q.title,
              description: q.description,
              type: q.type,
              required: q.required,
              order: q.order,
              settings: q.settings!,
            })),
          },
        },
        include: { questions: true },
      });

      return newForm;
    }),
});
