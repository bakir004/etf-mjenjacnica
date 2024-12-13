import fs from "fs";
export interface Test {
  id: number;
  patch: Array<{ position: string; code: string }>;
  expect: string;
}
export interface Tests {
  tests: Array<Test>;
}

const testJsonFormatter = (filePath: string) => {
  const formattedTestJson: Tests = {
    tests: [],
  };

  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const testJson = JSON.parse(jsonData);

    const tests = testJson.tests;
    tests.forEach((item: any, i: number) => {
      const newTest: Test = {
        id: 0,
        patch: [],
        expect: "",
      };
      const patchArray = item.tools[0].patch;
      const newPatchArray: Array<{ position: string; code: string }> = [];
      patchArray.forEach((patch: any) => {
        newPatchArray.push({
          position: patch.position,
          code: patch.code,
        });
      });
      const expectedOutput = item.tools[2].execute.expect[0];
      newTest.id = i;
      newTest.patch = newPatchArray;
      newTest.expect = expectedOutput;
      formattedTestJson.tests.push(newTest);
    });

    fs.writeFileSync(filePath, JSON.stringify(formattedTestJson, null, 2));
    console.log("Successfully formatted the JSON file.");
  } catch (e) {
    console.error("An error occurred:", e);
  }
};
testJsonFormatter("src/tests/na2test.json");
