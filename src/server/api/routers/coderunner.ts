import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const coderunnerRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        codes: z
          .array(
            z.object({
              id: z.number(), // Validate that 'id' is a number
              code: z.string(), // Validate that 'code' is a string
            }),
          )
          .min(1), // Validates that 'codes' is a non-empty array of objects
        senderName: z.string(), // Validate that 'senderName' is a string
        senderEmail: z.string(), // Validate that 'senderEmail' is a string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const jsonInput = JSON.stringify({ codes: input.codes });
        const response = await fetch("http://167.99.134.197:8080/api/v1/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonInput,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to call external API: ${errorText}`);
        }

        const result: Array<{ output: string; error: string; id: number }> =
          await response.json();

        if (input.codes.some((code) => code.id === 0)) {
          await ctx.db.codeRequest.create({
            data: {
              senderName: input.senderName,
              senderEmail: input.senderEmail,
              code: input.codes[0]?.code || "",
            },
          });
        }
        return result.map((res) => ({
          output: res.output ?? "",
          error: res.error ?? "",
          id: res.id ?? 0,
        }));
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return [
          {
            output: "",
            error: "An error occurred while processing the request.",
            id: -1,
          },
        ];
      }
    }),
  getRequests: publicProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.codeRequest.findMany();
    return requests ?? null;
  }),
});
