"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import LoadingSpinnerSVG from "./Spinner";
import jsonTests from "../../tests/asp.json";

export function CodeForm({
  sendOutputAndError,
  reset,
}: {
  sendOutputAndError: (output: string, error: string) => void;
  reset: () => void;
}) {
  const tests = jsonTests.tests;

  const [code, setCode] = useState<string>("");
  const mutation = api.coderunner.getAll.useMutation();
  const { mutate, data, status } = mutation;

  const submit = (event: React.FormEvent) => {
    reset();
    event.preventDefault();

    if (!code || code.length === 0) {
      alert("Unesite Vaš C++ kod!");
      return;
    }

    const allCodes: string[] = [];
    tests.forEach((item) => {
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
      console.log(currentCode);
    });

    allCodes.forEach((currentCode, i) => {
      setTimeout(() => {
        mutate({ code: currentCode });
      }, i * 1000);
    });
  };

  useEffect(() => {
    if (data) sendOutputAndError(data.output, data.error);
    console.log(data?.output);
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

      <Button
        type="submit"
        className="flex items-center gap-1 bg-blue-900 text-white hover:bg-blue-800"
        disabled={status === "pending"}
      >
        {status === "pending" && <LoadingSpinnerSVG></LoadingSpinnerSVG>}
        Pokreni
      </Button>

      {data?.error && <p>Error: {data?.error}</p>}
    </form>
  );
}
