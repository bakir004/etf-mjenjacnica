import { env } from "process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs";
import path from "path";
import {
  type Test,
  type Tests,
  testsJsonToCodeParts,
  wrapMainCodeInMainFunction,
} from "~/lib/test";
import { toBase64 } from "~/lib/base64";

export const getTestFileNames = async () => {
  const folderPath = path.join(process.cwd(), "src", "tests"); // Safer way to build the path
  try {
    const files = await new Promise<string[]>((resolve) => {
      fs.readdir(folderPath, (err, files) => {
        resolve(files);
      });
    });
    // ok
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
    .mutation(async ({ input }) => {
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
        // console.log(result);
        return result;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return { output: "", error: error.message || error };
      }
    }),
  getRequests: publicProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.codeRequest.findMany({
      take: 100,
    });
    return requests ?? null;
  }),
  getTestFileNames: publicProcedure.query(async ({}) => {
    return getTestFileNames();
  }),
  getTestData: publicProcedure
    .input(z.object({ subject: z.string() })) // Takes a subject name as input
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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

        const mainCodes: { id: string; mainCode: string }[] = [];
        testJson.tests.forEach((test: Test) => {
          if (input.testIds.includes(test.id.toString())) {
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

        const results: {
          results: { output: string; error: string; mainCodeId: string }[];
        } = await response.json();
        return results.results;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return [{ output: "", error: error.message || error, mainCodeId: "" }];
      }
    }),
  runAll: publicProcedure
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
    .mutation(async ({ input }) => {
      try {
        console.time("myCodeBlock");
        const codeRunnerUrl =
          env.CODE_RUNNER_JUDGE_URL +
          "/submissions/batch?base64_encoded=true&wait=true";
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

        const submission: {
          submissions: {
            language_id: number;
            source_code: string;
            expected_output: string;
            timeout: number;
          }[];
        } = { submissions: [] };
        testJson.tests.forEach((test: Test) => {
          if (input.testIds.includes(test.id.toString())) {
            const mainCodeForThisTest = test.patch.find(
              (patch) => patch.position === "main",
            )?.code;
            if (mainCodeForThisTest === undefined) {
              throw new Error(`Main code for test ${test.id} not found.`);
            }
            const aboveMain = test.patch.find(
              (patch) => patch.position === "above_main",
            )?.code;
            const topOfFile = test.patch.find(
              (patch) => patch.position === "top_of_file",
            )?.code;
            let completeCode = "";
            completeCode += (topOfFile ?? "") + "\n";
            completeCode += input.userCode ?? "" + "\n";
            completeCode += aboveMain ?? "" + "\n";
            completeCode += wrapMainCodeInMainFunction(mainCodeForThisTest);
            submission.submissions.push({
              language_id: 54,
              source_code: toBase64(completeCode),
              expected_output: toBase64(test.expect),
              timeout: 5,
            });
          }
        });
        console.timeEnd("myCodeBlock");
        console.time("timeToFetch");
        const response = await fetch(codeRunnerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submission),
        });
        console.timeEnd("timeToFetch");

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to call external API: ${errorText}`);
        }

        const results: { token: string }[] = await response.json();
        return results;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return [{ token: "" }];
      }
    }),
  runSingle: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        username: z.string(),
        userCode: z.string(),
        subject: z.string(),
        testId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const nullResult = {
        id: -1,
        stdout: "",
        time: "string",
        memory: 123,
        stderr: "string",
        token: "string",
        compile_output: "string",
        message: "string",
        status: { id: 4, description: "string" },
      };
      try {
        console.time("myCodeBlock");
        const codeRunnerUrl =
          env.CODE_RUNNER_JUDGE_URL +
          "/submissions?base64_encoded=true&wait=true";
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
        const test = testJson.tests.find((el) => el.id === input.testId);
        if (!test) {
          console.log("didnt find test " + input.testId);
          return nullResult;
        }

        const mainCodeForThisTest = test.patch.find(
          (patch) => patch.position === "main",
        )?.code;
        if (mainCodeForThisTest === undefined) {
          throw new Error(`Main code for test ${test.id} not found.`);
        }
        const aboveMain = test.patch.find(
          (patch) => patch.position === "above_main",
        )?.code;
        const topOfFile = test.patch.find(
          (patch) => patch.position === "top_of_file",
        )?.code;
        let completeCode = "";
        completeCode += (topOfFile ?? "") + "\n";
        completeCode += input.userCode ?? "" + "\n";
        completeCode += aboveMain ?? "" + "\n";
        completeCode += wrapMainCodeInMainFunction(mainCodeForThisTest);
        const singleSubmission = {
          language_id: 54,
          source_code: toBase64(completeCode),
          timeout: 5,
        };
        console.timeEnd("myCodeBlock");
        console.log(codeRunnerUrl);
        console.log(singleSubmission);
        const response = await fetch(codeRunnerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(singleSubmission),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to call external API: ${errorText}`);
        }

        const result: {
          id: number;
          stdout: string;
          time: string;
          memory: number;
          stderr: string | null;
          token: string;
          compile_output: string | null;
          message: string | null;
          status: { id: number; description: string };
        } = await response.json();
        result.id = input.testId;

        return result;
      } catch (error: any) {
        console.error("API call error:", error.message || error);

        return nullResult;
      }
    }),
  getSubmissionResults: publicProcedure
    .input(z.object({ tokens: z.array(z.string()) }))
    .query(async ({ input }) => {
      let codeRunnerUrl =
        env.CODE_RUNNER_JUDGE_URL +
        "/submissions/batch?base64_encoded=true&tokens=";
      if (!codeRunnerUrl)
        throw new Error("CODE_RUNNER_URL environment variable is not set.");

      codeRunnerUrl += input.tokens.join(",");
      console.log(codeRunnerUrl);
      const response = await fetch(codeRunnerUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const results: {
        submissions: {
          stdout: string;
          time: string;
          memory: number;
          stderr: string | null;
          token: string;
          compile_output: string | null;
          message: string | null;
          status: {
            id: number;
            description: string;
          };
        }[];
      } = await response.json();
      console.log(results);
      return results;
    }),
});
