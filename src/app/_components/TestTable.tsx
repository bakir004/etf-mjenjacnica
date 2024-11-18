"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CodeForm } from "./CodeForm";
import { SelectForm } from "./Select";
import aspz1 from "../../tests/aspz1.json";
import { type Tests } from "~/lib/test";
import { api } from "~/trpc/react";

export function TestTable({ fileNames }: { fileNames: string[] }) {
  const [outputs, setOutputs] = useState<
    { output: string; id: number; error: string }[]
  >([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("aspz1");
  const [tests, setTests] = useState<Tests>(aspz1);
  const [subjects, setSubjects] = useState<string[]>([]);

  const resetOutputs = () => {
    setOutputs([]);
  };
  const getResults = (results: string[]) => {
    const newOutputs = results.map((result, index) => ({
      output: result,
      id: index,
      error: "",
    }));

    setOutputs([...newOutputs]);
  };
  const getBatchResults = (
    results: { mainCodeId: string; output: string; error: string }[],
  ) => {
    const newOutputs = results.map((result) =>
      result.output.length > 0
        ? {
            output: result.output.replace(/\r/g, ""),
            id: Number(result.mainCodeId),
            error: "",
          }
        : { error: result.error, id: Number(result.mainCodeId), output: "" },
    );
    setOutputs((prevOutputs) => {
      const unsortedOutputs = [...prevOutputs, ...newOutputs];
      const sortedOutputs = unsortedOutputs.sort((a, b) =>
        a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
      );
      return sortedOutputs;
    });
  };
  useEffect(() => {
    setSubjects(fileNames);
  }, [fileNames]);
  const { data } = api.coderunner.getTestData.useQuery(
    { subject: selectedSubject },
    {
      enabled: !!selectedSubject,
    },
  );

  useEffect(() => {
    if (data && data !== tests) {
      setTests(data);
    }
  }, [data, tests]);

  const handleSubjectChange = (v: string) => {
    setSelectedSubject(v);
  };
  return (
    <div className="mt-2">
      <SelectForm
        name="forma"
        onChange={(v) => handleSubjectChange(v)}
        placeholder="Predmet"
        elements={subjects}
      ></SelectForm>
      <CodeForm
        sendBatchResults={getBatchResults}
        subject={selectedSubject}
        reset={resetOutputs}
        sendResults={getResults}
        tests={tests.tests}
      />
      {outputs.length > 0 && (
        <div className={`mt-4`}>
          Prošlo:{" "}
          {
            outputs.filter(
              (output: { output: string; id: number }, i) =>
                output.output.trim() === tests.tests[i]?.expect.trim(),
            ).length
          }
          /{tests.tests.length}
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
            {outputs.map(
              (
                item: { output: string; id: number; error: string },
                i: number,
              ) => (
                <TableRow
                  key={i}
                  className={`border-b border-neutral-500 ${
                    tests.tests[i]?.expect.trim() === item.output.trim()
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
                    {"int main() {\n"}
                    <span className="ml-[4ch]">
                      {tests.tests[i]?.patch[0]
                        ? tests.tests[i].patch[0].code
                        : ""}
                      {tests.tests[i]?.patch[1]
                        ? tests.tests[i].patch[1].code
                        : ""}
                      {tests.tests[i]?.patch[2]
                        ? tests.tests[i].patch[2].code
                        : ""}
                    </span>
                    {"\n    return 0;\n}\n"}
                  </TableCell>
                  <TableCell
                    className="border-r border-neutral-500"
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {tests.tests[i]?.expect}
                  </TableCell>
                  <TableCell
                    className="border-r border-neutral-500"
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.output.length > 0 ? item.output : item.error}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
