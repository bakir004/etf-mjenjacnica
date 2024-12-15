"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import { Progress } from "~/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { type Test } from "~/lib/test";
import { fromBase64 } from "~/lib/base64";

let sendingInterval: NodeJS.Timeout | null = null;
const DELAY_BETWEEN_SINGLE_SUBMISSIONS = 400;

export function CodeForm({
  reset,
  subject,
  tests,
  appendOutput,
  numOutputs,
}: {
  reset: () => void;
  subject: string;
  tests: Test[];
  appendOutput: (output: { output: string; error: string; id: number }) => void;
  numOutputs: number;
}) {
  const user = useUser();
  const [code, setCode] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState<number>(3);
  const [delay, setDelay] = useState<number>(2000);

  const judgeSingleCodeRunner = api.coderunner.runSingle.useMutation({
    onSuccess: (data: {
      id: number;
      stdout: string;
      time: string;
      memory: number;
      stderr: string | null;
      token: string;
      compile_output: string | null;
      message: string | null;
      status: { id: number; description: string };
    }) => {
      appendOutput({
        output:
          fromBase64(data.stdout) ??
          fromBase64(data.message ?? "") ??
          "UNDEFINED",
        error:
          fromBase64(data.compile_output ?? "") ??
          fromBase64(data.stderr ?? "") ??
          "UNDEFINED",
        id: data.id,
      });
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const judgeRun1po1 = () => {
    reset();
    let i = 0;
    setIsRunning(true);

    sendingInterval = setInterval(() => {
      const requestBody = {
        userId: user.user?.id ?? "null",
        email: user.user?.emailAddresses[0]?.emailAddress ?? "null",
        username: user.user?.fullName ?? "nepoznat",
        userCode: code ?? "",
        subject: subject,
        testId: i,
      };
      judgeSingleCodeRunner.mutate(requestBody);
      i++;
      if (i >= tests.length) {
        clearInterval(sendingInterval!);
        sendingInterval = null;
      }
    }, DELAY_BETWEEN_SINGLE_SUBMISSIONS);
  };

  const submit = async (event: React.FormEvent) => {
    reset();
    event.preventDefault();

    if (!code || code.length === 0) {
      alert("Unesite Vaš C++ kod!");
      return;
    }
    judgeRun1po1();
  };

  const clear = (event: React.FormEvent) => {
    event.preventDefault();
    if (sendingInterval) {
      clearInterval(sendingInterval);
      sendingInterval = null;
      setIsRunning(false);
    }
  };

  const batchCodeRunner = api.coderunner.runBatch.useMutation({
    onSuccess: (
      data: { output: string; error: string; mainCodeId: string }[],
    ) => {
      data.forEach((output) => {
        appendOutput({
          output: output.output,
          error: output.error,
          id: parseInt(output.mainCodeId),
        });
      });
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const batchRun = async (event: React.FormEvent) => {
    setIsRunning(true);
    event.preventDefault();
    reset();
    const allTestIds = Array.from({ length: tests.length }, (_, i) =>
      i.toString(),
    );

    for (let i = 0; i < allTestIds.length; i += batchSize) {
      const testIdsBatch = allTestIds.slice(i, i + batchSize); // Get the next batch of test IDs
      batchCodeRunner.mutate({
        userId: user.user?.id ?? "null",
        email: user.user?.emailAddresses[0]?.emailAddress ?? "null",
        username: user.user?.fullName ?? "nepoznat",
        userCode: code,
        subject: subject,
        testIds: testIdsBatch,
      });

      if (i + batchSize < allTestIds.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  useEffect(() => {
    if (numOutputs === tests.length) setIsRunning(false);
  }, [numOutputs]);

  return (
    <>
      <form onSubmit={submit}>
        <textarea
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="my-2 min-h-32 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 font-mono text-sm focus:outline-none"
          placeholder="Unesite svoj C++ kod ovdje..."
        ></textarea>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            className="flex items-center gap-1 bg-blue-900 text-white hover:bg-blue-800"
            disabled={isRunning}
          >
            {isRunning && <LoadingSpinnerSVG></LoadingSpinnerSVG>}
            Pokreni
          </Button>
          <Button
            onClick={batchRun}
            className="flex items-center gap-1 bg-orange-600 text-white hover:bg-orange-600"
            disabled={isRunning}
          >
            {isRunning && <LoadingSpinnerSVG></LoadingSpinnerSVG>}
            Pokreni (sa memory leak testom)
          </Button>
          <Button
            onClick={clear}
            className="flex items-center gap-1 bg-red-700 text-white hover:bg-red-600"
            disabled={!isRunning}
          >
            Otkaži
          </Button>
          <Progress value={(numOutputs / tests.length) * 100}></Progress>
        </div>
      </form>
    </>
  );
}
