"use client";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import { Progress } from "~/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { delimiter } from "~/lib/test";

export function CodeForm({
  sendResults,
  reset,
  subject,
}: {
  sendResults: (results: string[]) => void;
  reset: () => void;
  subject: string;
}) {
  const user = useUser();
  const [code, setCode] = useState<string>("");
  const [runtimeError, setRuntimeError] = useState<string>("");
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

  return (
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
          disabled={status === "pending" || (progress > 0 && progress < 90)}
        >
          {(status === "pending" || (progress > 0 && progress < 90)) && (
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
  );
}
