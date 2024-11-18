import { env } from "process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs";
import path from "path";
import {
  Test,
  Tests,
  testsJsonToCodeParts,
  wrapMainCodeInMainFunction,
} from "~/lib/test";

export const getTestFileNames = async () => {
  const folderPath = path.join(process.cwd(), "src", "tests"); // Safer way to build the path
  try {
    const files = await new Promise<string[]>((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject("Failed to read directory: " + err);
        } else {
          resolve(files);
        }
      });
    });
    files.forEach((file, index) => {
      files[index] = file.replace(".json", "");
    });
    return files;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw new Error("Failed to fetch test file names.");
  }
};

export const coderunnerRouter = createTRPCRouter({
  run: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        username: z.string(),
        userCode: z.string(),
        subject: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const codeRunnerUrl =
          env.NODE_ENV === "production"
            ? env.CODE_RUNNER_URL + "/api/v1/run"
            : "http://localhost:8080/api/v1/run";
        if (!codeRunnerUrl)
          throw new Error("CODE_RUNNER_URL environment variable is not set.");

        const testJsonFileName = `${input.subject}.json`;
        const testJsonFilePath = path.join(
          process.cwd(),
          "src",
          "tests",
          testJsonFileName,
        );
        const testJson: Tests = JSON.parse(
          fs.readFileSync(testJsonFilePath, "utf-8"),
        );

        const parts = testsJsonToCodeParts(testJson);
        let completeCode = "";
        completeCode += parts.topOfFileCode + "\n";
        completeCode += input.userCode + "\n";
        completeCode += parts.aboveMainCode + "\n";
        const main = wrapMainCodeInMainFunction(parts.mainCode);
        completeCode += main;
        const requestBody = {
          UserCode: completeCode,
        };
        const response = await fetch(codeRunnerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to call external API: ${errorText}`);
        }

        const result: { output: string; error: string } = await response.json();
        console.log(result);
        return result;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return { output: "", error: error.message || error };
      }
    }),
  getRequests: publicProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.codeRequest.findMany();
    return requests ?? null;
  }),
  getTestFileNames: publicProcedure.query(async ({ ctx }) => {
    return getTestFileNames();
  }),
  getTestData: publicProcedure
    .input(z.object({ subject: z.string() })) // Takes a subject name as input
    .query(async ({ ctx, input }) => {
      const testJsonFileName = `${input.subject}.json`;
      const testJsonFilePath = path.join(
        process.cwd(),
        "src",
        "tests",
        testJsonFileName,
      );

      try {
        const jsonData = await fs.promises.readFile(testJsonFilePath, "utf-8");
        const testJson: Tests = JSON.parse(jsonData);
        return testJson;
      } catch (error) {
        console.error("Error reading or parsing file:", error);
        throw new Error("Failed to fetch test data.");
      }
    }),
  runBatch: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        username: z.string(),
        userCode: z.string(),
        subject: z.string(),
        testIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.time("myCodeBlock");
        const codeRunnerUrl =
          env.NODE_ENV === "production"
            ? env.CODE_RUNNER_URL + "/api/v1/batch-run"
            : "http://localhost:8080/api/v1/batch-run";
        if (!codeRunnerUrl)
          throw new Error("CODE_RUNNER_URL environment variable is not set.");

        const testJsonFileName = `${input.subject}.json`;
        const testJsonFilePath = path.join(
          process.cwd(),
          "src",
          "tests",
          testJsonFileName,
        );
        const testJson: Tests = JSON.parse(
          fs.readFileSync(testJsonFilePath, "utf-8"),
        );

        let mainCodes: { id: string; mainCode: string }[] = [];
        testJson.tests.forEach((test: Test, i: number) => {
          if (input.testIds.includes(test.id.toString())) {
            console.log(test.id + " . " + input.testIds);
            const mainCodeForThisTest = test.patch.find(
              (patch) => patch.position === "main",
            )?.code;
            if (mainCodeForThisTest === undefined) {
              throw new Error(`Main code for test ${test.id} not found.`);
            }
            mainCodes.push({
              id: test.id.toString(),
              mainCode: wrapMainCodeInMainFunction(mainCodeForThisTest),
            });
          }
        });
        const parts = testsJsonToCodeParts(testJson);
        let completeCode = "";
        completeCode += parts.topOfFileCode + "\n";
        completeCode += input.userCode + "\n";
        completeCode += parts.aboveMainCode + "\n";
        const requestBody = {
          userId: input.userId,
          userCode: completeCode,
          mainCodes: mainCodes,
        };
        // console.log(requestBody);
        console.timeEnd("myCodeBlock");
        console.time("timeToFetch");
        const response = await fetch(codeRunnerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        console.timeEnd("timeToFetch");

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to call external API: ${errorText}`);
        }

        const result: { output: string; error: string } = await response.json();
        console.log(result);
        return result;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return { output: "", error: error.message || error };
      }
    }),
});
