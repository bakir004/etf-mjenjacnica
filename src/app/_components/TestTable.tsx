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
import asp6 from "../../tests/asp6.json";
import { type Tests } from "~/lib/test";
import { api } from "~/trpc/react";

export function TestTable({ fileNames }: { fileNames: string[] }) {
  const [outputs, setOutputs] = useState<
    { output: string; id: number; error: string }[]
  >([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("asp6");
  const [tests, setTests] = useState<Tests>(asp6);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [passed, setPassed] = useState(0);

  const resetOutputs = () => {
    setOutputs([]);
  };
  const appendOutput = (output: {
    output: string;
    error: string;
    id: number;
  }): void => {
    setOutputs((prevOutputs) => {
      const newOutput = {
        output: output.output,
        error: output.error,
        id: output.id,
      };
      const unsortedOutputs = [...prevOutputs, newOutput];
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

  useEffect(() => {
    const passedTests = outputs.filter(
      (output: { output: string; id: number }, i) =>
        output.output.trim() === tests.tests[i]?.expect.trim(),
    ).length;
    setPassed(passedTests);
  }, [outputs]);

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
        numOutputs={outputs.length}
        subject={selectedSubject}
        reset={resetOutputs}
        tests={tests.tests}
        appendOutput={appendOutput}
        passed={passed}
      />
      {outputs.length > 0 && (
        <div className={`mt-4 font-bold`}>
          <span className="text-violet-300">Testirano</span>/
          <span className="text-green-300">Prošlo</span>/
          <span className="text-red-400">Palo</span>/Ukupno:{" "}
          <span className="text-violet-300">{outputs.length}</span>/
          <span className="text-green-300">{passed}</span>/
          <span className="text-red-400">{outputs.length - passed}</span>/
          {tests.tests.length}
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
                    {item.error ? item.error : item.output}
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
