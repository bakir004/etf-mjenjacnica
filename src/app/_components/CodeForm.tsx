"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import aspTests from "../../tests/asp.json";
import naTests from "../../tests/na.json";
import { Progress } from "~/components/ui/progress";

export function CodeForm({
  sendResults,
  reset,
  tests,
}: {
  sendResults: (results: Array<{ output: string; error: string }>) => void;
  reset: () => void;
  tests: any;
}) {
  const [code, setCode] = useState<string>("");
  const mutation = api.coderunner.getAll.useMutation();
  const { mutate, data, status } = mutation;
  const [progress, setProgress] = useState(0);

  const submit = (event: React.FormEvent) => {
    setProgress(0);
    reset();
    event.preventDefault();

    if (!code || code.length === 0) {
      alert("Unesite Vaš C++ kod!");
      return;
    }

    const allCodes: string[] = [];
    tests.forEach((item: any) => {
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
      allCodes.push(currentCode);
    });

    mutate({ codes: allCodes });
    // Assuming you have a setProgress function defined somewhere

    setTimeout(() => {
      setProgress(15); // Initial progress
    }, 1000);

    setTimeout(() => {
      setProgress(35); // Increase more initially
    }, 2500);

    setTimeout(() => {
      setProgress(50); // Gradual increase
    }, 6000);

    setTimeout(() => {
      setProgress(65); // Continuing gradual increase
    }, 9000);

    setTimeout(() => {
      setProgress(75); // Slower increase
    }, 13000);

    setTimeout(() => {
      setProgress(85); // Slower increase
    }, 15000);

    setTimeout(() => {
      setProgress(92); // Final push
    }, 16000);

    setTimeout(() => {
      setProgress(100); // Complete loading
    }, 17000);
  };

  useEffect(() => {
    if (data) sendResults(data);
  }, [data]);

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
          disabled={status === "pending"}
        >
          {status === "pending" && <LoadingSpinnerSVG></LoadingSpinnerSVG>}
          Pokreni
        </Button>
        {status === "pending" && (
          <Progress className="bg-blue-800" value={progress} />
        )}
      </div>
    </form>
  );
}
