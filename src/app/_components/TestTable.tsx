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
import naTests from "../../tests/na.json";
import asp4Tests from "../../tests/asp4.json";
import asp5Tests from "../../tests/asp5.json";
import aspz1Tests from "../../tests/aspz1.json";
import aspz2z1Tests from "../../tests/aspz2-1.json";
import aspz2z2Tests from "../../tests/aspz2-2.json";
import { CodeForm } from "./CodeForm";
import { SelectForm } from "./Select";

export function TestTable() {
  const [outputs, setOutputs] = useState<
    { output: string; error: string; id: number }[]
  >([]);
  const [tests, setTests] = useState<any>(asp5Tests.tests);
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
      return sortedOutputs;
    });
  };

  const handleSubjectChange = (v: string) => {
    if (v === "ASP-PZ4") setTests(asp4Tests.tests);
    else if (v === "ASP-PZ5") setTests(asp5Tests.tests);
    else if (v === "ASP-Z1") setTests(aspz1Tests.tests);
    else if (v === "ASP-Z2-1") setTests(aspz2z1Tests.tests);
    else if (v === "ASP-Z2-2") setTests(aspz2z2Tests.tests);
    else if (v === "NA-2") setTests(naTests.tests);
  };
  return (
    <div className="mt-2">
      <SelectForm
        name="forma"
        onChange={(v) => handleSubjectChange(v)}
        placeholder="Predmet"
        elements={[
          "ASP-PZ4",
          "ASP-PZ5",
          "ASP-Z1",
          "ASP-Z2-1",
          "ASP-Z2-2",
          "NA-2",
        ]}
      ></SelectForm>
      <CodeForm tests={tests} reset={resetOutputs} sendResults={getResults} />
      {outputs.length > 0 && (
        <div className={`mt-4`}>
          Prošlo:{" "}
          {
            formattedTests.filter(
              (item, i) => item.expect.trim() === outputs[i]?.output.trim(),
            ).length
          }
          /{formattedTests.length}
        </div>
      )}
      {outputs.length > 0 && (
        <Table className="mt-4 border-b border-neutral-500">
          <TableHeader>
            <TableRow className="border border-neutral-500 font-extrabold">
              <TableHead className="border-r border-neutral-500 font-extrabold">
                Redni broj
              </TableHead>
              <TableHead className="border-r border-neutral-500 font-extrabold">
                Kod testa
              </TableHead>
              <TableHead className="border-r border-neutral-500 font-extrabold">
                Očekivani izlaz
              </TableHead>
              <TableHead className="font-extrabold">Vaš izlaz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">
            {outputs.map((item: any, i: number) => (
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
                  {(tests[i]?.tools[0] &&
                    typeof tests[i].tools[0] !== "string" &&
                    tests[i].tools[0].patch?.[1]?.position === "above_main") ||
                  (tests[i]?.tools[0] &&
                    typeof tests[i].tools[0] !== "string" &&
                    tests[i].tools[0].patch?.[1]?.position === "top_of_file")
                    ? tests[i]?.tools[0] &&
                      typeof tests[i].tools[0] !== "string" &&
                      tests[i].tools[0].patch?.[1]?.code +
                        "\n\n//Vaš kod ide ovdje...\n\n"
                    : null}
                  {tests[i]?.tools[0] &&
                  typeof tests[i].tools[0] !== "string" &&
                  tests[i].tools[0].patch?.[0]?.position === "main"
                    ? "int main() {\n"
                    : null}
                  <div className="ml-6">
                    {tests[i]?.tools[0] &&
                      typeof tests[i].tools[0] !== "string" &&
                      tests[i].tools[0].patch?.[0]?.code}
                  </div>
                  {tests[i]?.tools[0] &&
                  typeof tests[i].tools[0] !== "string" &&
                  tests[i].tools[0].patch?.[0]?.position === "main"
                    ? "}"
                    : null}
                </TableCell>
                <TableCell
                  className="border-r border-neutral-500"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {tests[i]?.tools[2] &&
                    typeof tests[i].tools[2] !== "string" &&
                    tests[i].tools[2]?.execute?.expect}
                </TableCell>
                <TableCell
                  className="border-r border-neutral-500"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item?.output && item.output.length > 0
                    ? item?.output
                    : item?.error}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
