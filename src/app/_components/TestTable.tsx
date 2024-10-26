"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import aspTests from "../../tests/asp.json";
import naTests from "../../tests/na.json";
import { CodeForm } from "./CodeForm";
import { SelectForm } from "./Select";

export function TestTable() {
  const [outputs, setOutputs] = useState<
    { output: string; error: string; id: number }[]
  >([]);
  const [tests, setTests] = useState<any>(aspTests.tests);
  const formattedTests: {
    id: number;
    code: string;
    expect: string;
  }[] = [];
  tests.forEach((item: any, i: number) => {
    const expect =
      item?.tools[2] &&
      typeof item.tools[2] !== "string" &&
      item.tools[2]?.execute?.expect;
    const firstExpect =
      Array.isArray(expect) && expect.length > 0 ? expect[0] : undefined;
    if (firstExpect === undefined) return;
    let currentCode = "";
    currentCode +=
      (item.tools[0] &&
        typeof item.tools[0] !== "string" &&
        item.tools[0].patch?.[1]?.position === "above_main") ||
      (item?.tools[0] &&
        typeof item.tools[0] !== "string" &&
        item.tools[0].patch?.[1]?.position === "top_of_file")
        ? item?.tools[0] &&
          typeof item.tools[0] !== "string" &&
          item.tools[0].patch?.[1]?.code + "\n\n//Vaš kod ide ovdje...\n\n"
        : "";
    currentCode +=
      item?.tools[0] &&
      typeof item.tools[0] !== "string" &&
      item.tools[0].patch?.[0]?.position === "main"
        ? "int main() {\n"
        : "";
    currentCode +=
      item?.tools[0] &&
      typeof item.tools[0] !== "string" &&
      item.tools[0].patch?.[0]?.code + "\n}";
    formattedTests.push({
      id: i,
      expect: firstExpect,
      code: currentCode,
    });
  });
  const resetOutputs = () => {
    setOutputs([]);
  };
  const getResults = (
    results: Array<{ output: string; error: string; id: number }>,
  ) => {
    setOutputs((prevOutputs) => {
      const unsortedOutputs = [...prevOutputs, ...results];
      const sortedOutputs = unsortedOutputs.sort((a, b) =>
        a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
      );
      console.log(sortedOutputs);
      return sortedOutputs;
    });
  };

  const handleSubjectChange = (v: string) => {
    if (v === "NA") setTests(naTests.tests);
    else setTests(aspTests.tests);
  };
  return (
    <>
      <SelectForm
        name="forma"
        onChange={(v) => handleSubjectChange(v)}
        placeholder="Predmet"
        elements={["NA", "ASP"]}
      ></SelectForm>
      <CodeForm tests={tests} reset={resetOutputs} sendResults={getResults} />
      {outputs.length > 0 && (
        <span className={`mt-4`}>
          Prošlo:{" "}
          {
            formattedTests.filter(
              (item, i) => item.expect.trim() === outputs[i]?.output.trim(),
            ).length
          }
          /{formattedTests.length}
        </span>
      )}
      {outputs.length > 0 && (
        <Table className="mt-4">
          <TableHeader>
            <TableRow className="border border-neutral-500">
              <TableHead className="border-r border-neutral-500">
                Redni broj
              </TableHead>
              <TableHead className="border-r border-neutral-500">
                Kod testa
              </TableHead>
              <TableHead className="w-[150px] border-r border-neutral-500">
                Očekivani izlaz
              </TableHead>
              <TableHead className="w-[150px]">Vaš izlaz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">
            {tests.map((item: any, i: number) => (
              <TableRow
                key={i}
                className={`border-b border-neutral-500 ${
                  formattedTests[i]?.expect.trim() === outputs[i]?.output.trim()
                    ? "bg-green-800/40 hover:bg-green-800/50"
                    : "bg-red-600/40 hover:bg-red-600/50"
                }`}
              >
                <TableCell className="border-l border-r border-neutral-500 font-medium">
                  {i + 1}
                </TableCell>
                <TableCell
                  className="border-r border-neutral-500 text-xs"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {(item?.tools[0] &&
                    typeof item.tools[0] !== "string" &&
                    item.tools[0].patch?.[1]?.position === "above_main") ||
                  (item?.tools[0] &&
                    typeof item.tools[0] !== "string" &&
                    item.tools[0].patch?.[1]?.position === "top_of_file")
                    ? item?.tools[0] &&
                      typeof item.tools[0] !== "string" &&
                      item.tools[0].patch?.[1]?.code +
                        "\n\n//Vaš kod ide ovdje...\n\n"
                    : null}
                  {item?.tools[0] &&
                  typeof item.tools[0] !== "string" &&
                  item.tools[0].patch?.[0]?.position === "main"
                    ? "int main() {\n"
                    : null}
                  <div className="ml-6">
                    {item?.tools[0] &&
                      typeof item.tools[0] !== "string" &&
                      item.tools[0].patch?.[0]?.code}
                  </div>
                  {item?.tools[0] &&
                  typeof item.tools[0] !== "string" &&
                  item.tools[0].patch?.[0]?.position === "main"
                    ? "}"
                    : null}
                </TableCell>
                <TableCell
                  className="border-r border-neutral-500"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item?.tools[2] &&
                    typeof item.tools[2] !== "string" &&
                    item.tools[2]?.execute?.expect}
                </TableCell>
                <TableCell
                  className="border-r border-neutral-500"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {outputs[i]?.output && outputs[i].output.length > 0
                    ? outputs[i]?.output
                    : outputs[i]?.error}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
