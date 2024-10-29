"use client";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import { Progress } from "~/components/ui/progress";
import { BATCH_SIZE } from "~/lib/constants";
import { useUser } from "@clerk/nextjs";

export function CodeForm({
  sendResults,
  reset,
  tests,
}: {
  sendResults: (
    results: Array<{ output: string; error: string; id: number }>,
  ) => void;
  reset: () => void;
  tests: any;
}) {
  const user = useUser();
  const [code, setCode] = useState<string>("");
  const mutation = api.coderunner.getAll.useMutation({
    onSuccess: (data) => {
      if (data) sendResults(data);
    },
  });
  const { mutate, data, status, error } = mutation;
  const [progress, setProgress] = useState(0);

  const submit = (event: React.FormEvent) => {
    setProgress(0);
    reset();
    event.preventDefault();

    if (!code || code.length === 0) {
      alert("Unesite Vaš C++ kod!");
      return;
    }

    const allCodes: { id: number; code: string }[] = [];
    tests.forEach((item: any, i: number) => {
      let currentCode = "";
      (item?.tools[0] &&
        typeof item.tools[0] !== "string" &&
        item.tools[0].patch?.[1]?.position === "above_main") ||
      (item?.tools[0] &&
        typeof item.tools[0] !== "string" &&
        item.tools[0].patch?.[1]?.position === "top_of_file")
        ? (currentCode +=
            item?.tools[0] &&
            typeof item.tools[0] !== "string" &&
            item.tools[0].patch?.[1]?.code + "\n")
        : "";

      currentCode += code;

      item?.tools[0] &&
      typeof item.tools[0] !== "string" &&
      item.tools[0].patch?.[0]?.position === "main"
        ? (currentCode += "\nint main() {\n")
        : "";
      currentCode +=
        item?.tools[0] &&
        typeof item.tools[0] !== "string" &&
        item.tools[0].patch?.[0]?.code;

      item?.tools[0] &&
      typeof item.tools[0] !== "string" &&
      item.tools[0].patch?.[0]?.position === "main"
        ? (currentCode += "\n}")
        : "";
      allCodes.push({ id: i, code: currentCode });
    });

    for (let i = 0; i < allCodes.length; i += BATCH_SIZE) {
      setTimeout(() => {
        console.log("Getting " + i + " to " + (i + BATCH_SIZE));
        const codeBatch = allCodes.slice(i, BATCH_SIZE + i);
        mutate({
          codes: codeBatch,
          senderEmail: user.user?.emailAddresses[0]?.emailAddress || "NULL",
          senderName: user.user?.fullName || "NULL",
        });
        setProgress(((i + BATCH_SIZE) / allCodes.length) * 100);
      }, i * 400);
    }
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
    </form>
  );
}
