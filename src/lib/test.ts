export interface Test {
  id: number;
  patch: Array<{ position: string; code: string }>;
  expect: string;
}
export interface Tests {
  tests: Array<Test>;
}

interface CodeParts {
  topOfFileCode: string;
  aboveMainCode: string;
  mainCode: string;
}

export const delimiter = "-~=BOMBOCLAAT=~-";

function removeCommonLines(
  topOfFileCode: string,
  aboveMainCode: string,
): { uniqueTopOfFileCode: string; filteredAboveMainCode: string } {
  const removeDuplicates = (input: string): string => {
    const lines = input.split("\n");
    const uniqueLines = Array.from(new Set(lines));
    return uniqueLines.join("\n");
  };

  const uniqueTopOfFileCode = removeDuplicates(topOfFileCode);
  const uniqueAboveMainCode = removeDuplicates(aboveMainCode);

  const topOfFileLines = uniqueTopOfFileCode.split("\n");
  const aboveMainLines = uniqueAboveMainCode.split("\n");

  const topOfFileSet = new Set(topOfFileLines);

  const filteredAboveMainCode = aboveMainLines
    .filter((line) => !topOfFileSet.has(line))
    .join("\n");

  return {
    uniqueTopOfFileCode,
    filteredAboveMainCode,
  };
}

export const testsJsonToCodeParts = (testJson: Tests): CodeParts => {
  let topOfFileCode = "";
  let aboveMainCode = "";
  let mainCode = "";
  testJson.tests.forEach((test: Test) => {
    test.patch.forEach((patch) => {
      if (patch.position === "top_of_file") topOfFileCode += patch.code + "\n";
    });
    test.patch.forEach((patch) => {
      if (patch.position === "above_main") aboveMainCode += patch.code + "\n";
    });
    test.patch.forEach((patch) => {
      if (patch.position === "main") {
        mainCode += "try {\n";
        mainCode += patch.code + "\n";
        mainCode += "} catch (...) {\n";
        mainCode +=
          'std::cerr << "Vas kod je bacio neocekivan izuzetak!" << std::endl;\n';
        mainCode += "}\n";
        mainCode += 'std::cout << "' + delimiter + '";\n';
      }
    });
  });
  const { uniqueTopOfFileCode, filteredAboveMainCode } = removeCommonLines(
    topOfFileCode,
    aboveMainCode,
  );
  topOfFileCode = uniqueTopOfFileCode;
  aboveMainCode = filteredAboveMainCode;
  return { topOfFileCode, aboveMainCode, mainCode };
};

export const wrapMainCodeInMainFunction = (mainCode: string): string => {
  return `int main() {\n${mainCode}\nreturn 0;\n}`;
};
