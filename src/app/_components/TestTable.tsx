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
import jsonTests from "../../tests/asp.json";
import { CodeForm } from "./CodeForm";

export function TestTable() {
  const [outputs, setOutputs] = useState<{ output: string; error: string }[]>(
    [],
  );
  const tests = jsonTests.tests;
  const resetOutputs = () => {
    setOutputs([]);
  };
  const getOutputAndError = (output: string, error: string) => {
    setOutputs((prev) => [...prev, { output, error }]);
    console.log(outputs);
  };
  return (
    <>
      <CodeForm reset={resetOutputs} sendOutputAndError={getOutputAndError} />
      <Table className="mt-4">
        <TableHeader>
          <TableRow className="border border-neutral-500">
            <TableHead className="border-r border-neutral-500">
              Redni broj
            </TableHead>
            <TableHead className="border-r border-neutral-500">
              Kod testa
            </TableHead>
            <TableHead className="border-r border-neutral-500">
              Očekivani izlaz
            </TableHead>
            <TableHead className="">Vaš izlaz</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono">
          {tests.map((item, i) => (
            <TableRow
              key={i}
              className="border-b border-neutral-500 bg-green-800/40 bg-red-600/40 hover:bg-green-800/50 hover:bg-red-600/50"
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
                {outputs[i]?.output}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
