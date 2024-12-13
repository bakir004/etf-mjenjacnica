"use client";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import { Progress } from "~/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { delimiter, type Test } from "~/lib/test";

export function CodeForm({
  sendResults,
  sendBatchResults,
  reset,
  subject,
  tests,
}: {
  sendResults: (results: string[]) => void;
  sendBatchResults: (
    results: { mainCodeId: string; output: string; error: string }[],
  ) => void;
  reset: () => void;
  subject: string;
  tests: Test[];
}) {
  const user = useUser();
  const [code, setCode] = useState<string>("");
  const [runtimeError, setRuntimeError] = useState<string>("");
  const [batchSize, setBatchSize] = useState<number>(4);
  const [delay, setDelay] = useState<number>(2500);
  const codeRunner = api.coderunner.run.useMutation({
    onSuccess: (data: { output: string; error: string }) => {
      if (data?.error) {
        setRuntimeError(data.error);
      } else {
        const results = data?.output?.split(delimiter);
        results.pop();
        results.forEach((result, index) => {
          results[index] = result.trim();
          results[index] = results[index].replace(/\r/g, "");
        });
        if (data) sendResults(results);
      }
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });
  const { mutate, status, error } = codeRunner;
  const [progress, setProgress] = useState(0);

  const submit = async (event: React.FormEvent) => {
    setProgress(0);
    reset();
    event.preventDefault();
    setRuntimeError("");

    if (!code || code.length === 0) {
      alert("Unesite Vaš C++ kod!");
      return;
    }

    mutate({
      userId: user.user?.id ?? "null",
      email: user.user?.emailAddresses[0]?.emailAddress ?? "null",
      username: user.user?.fullName ?? "nepoznat",
      userCode: code,
      subject: subject,
    });
  };

  const batchCodeRunner = api.coderunner.runBatch.useMutation({
    onSuccess: (
      data: { output: string; error: string; mainCodeId: string }[],
    ) => {
      sendBatchResults(data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const batchRun = async () => {
    setProgress(0);
    setRuntimeError("");
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
      setProgress(((i + batchSize) / allTestIds.length) * 100);

      if (i + batchSize < allTestIds.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

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
            disabled={
              status === "pending" ||
              batchCodeRunner.status === "pending" ||
              (progress > 0 && progress < 90)
            }
          >
            {(status === "pending" ||
              batchCodeRunner.status === "pending" ||
              (progress > 0 && progress < 90)) && (
              <LoadingSpinnerSVG></LoadingSpinnerSVG>
            )}
            Pokreni
          </Button>
          <Progress className="bg-blue-800" value={progress} />
          {error && <div className="text-sm text-red-700">{error.message}</div>}
        </div>
        {runtimeError && (
          <div className="mt-2 rounded bg-neutral-800 p-4 font-mono text-sm text-red-500">
            {runtimeError}
          </div>
        )}
      </form>
      <div className="flex items-center gap-2">
        <Button
          onClick={batchRun}
          className="mt-2 flex items-center gap-1 bg-orange-700 text-white hover:bg-orange-600"
          disabled={
            batchCodeRunner.status === "pending" ||
            status === "pending" ||
            (progress > 0 && progress < 90)
          }
        >
          {(batchCodeRunner.status === "pending" ||
            status === "pending" ||
            (progress > 0 && progress < 90)) && (
            <LoadingSpinnerSVG></LoadingSpinnerSVG>
          )}
          Batch pokretanje
        </Button>
        <p className="grow text-sm italic">
          Batch pokretanje radi kao staro, dok novo pokreće sve testove
          odjednom, i ako se desi greška u jednom, svi će pasti. Ako imate sve
          implementirano, preporučujemo novo pokretanje.
        </p>
      </div>
    </>
  );
}
