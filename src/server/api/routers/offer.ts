import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const offerRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(1), // Required field
        creatorId: z.string().min(1), // Required field
        creatorName: z.string().min(1), // Required field
        subjectGive: z.string().min(1), // Required field
        timeGive: z.string().min(1), // Required field
        dayGive: z.string().min(1), // Required field
        subjectWant: z.string().min(1), // Required field
        timeWant: z.string().min(1), // Required field
        dayWant: z.string().min(1), // Required field
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.offer.create({
        data: {
          phoneNumber: input.phoneNumber,
          creatorId: input.creatorId,
          creatorName: input.creatorName,
          subjectGive: input.subjectGive,
          timeGive: input.timeGive,
          dayGive: input.dayGive,
          subjectWant: input.subjectWant,
          timeWant: input.timeWant,
          dayWant: input.dayWant,
        },
      });
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.offer.findMany(); // Fetch all offers from the database
  }),

  deleteOffer: publicProcedure
    .input(
      z.object({
        id: z.number().min(1), // Validate that the ID is a positive integer
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedOffer = await ctx.db.offer.delete({
        where: {
          id: input.id, // Delete offer based on its ID
        },
      });
      return deletedOffer; // Return the deleted offer (optional)
    }),
});
