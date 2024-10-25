import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const coderunnerRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        code: z.string().min(1), // Validates that 'code' is a non-empty string
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const jsonInput = JSON.stringify({ code: input.code });
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

        const result: { output: string; error: string } = await response.json();

        return {
          output: result.output ?? "",
          error: result.error ?? "",
        };
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return {
          output: "",
          error: "An error occurred while processing the request.",
        };
      }
    }),
});
