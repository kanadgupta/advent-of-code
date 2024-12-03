import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

/**
 * Reads the file (must be in the same directory as this TS file)
 * and returns its contents as an array, split by line
 */
function getInputs(fileName: string) {
  const file = fs.readFileSync(
    path.resolve(__dirname, fileName),
    { "encoding": "utf-8" },
  );

  return file.trim().split("\n").join("");
}

type MatchType = "mul" | "do" | "don't";

/**
 * Extracts the two numbers from the input string and multiplies them.
 */
function extractAndMultiplyNumbers(input: string) {
  const regex = /[0-9]+/g;
  const num1 = Number(regex.exec(input)?.[0]);
  const num2 = Number(regex.exec(input)?.[0]);

  return num1 * num2;
}

function getResult(input: string) {
  let partOneResult = 0;
  let partTwoResult = 0;

  const regex = /(mul\([0-9]+,[0-9]+\))|(do\(\))|(don't\(\))/g;
  let match = regex.exec(input);

  const rawResults: RegExpExecArray[] = [];
  while (match) {
    rawResults.push(match);
    match = regex.exec(input);
  }

  const typedResults = rawResults.map<{ type: MatchType; result: string }>(
    (res) => {
      let type: MatchType;
      if (res[0].startsWith("mul")) {
        type = "mul";
      } else if (res[0].startsWith("don't")) {
        type = "don't";
      } else {
        type = "do";
      }

      return { type, result: res[0] };
    },
  );

  partOneResult = typedResults.reduce<number>((prev, current) => {
    if (current.type === "mul") {
      return prev + extractAndMultiplyNumbers(current.result);
    }
    return prev;
  }, 0);

  let enabled = true;

  partTwoResult = typedResults.reduce<number>((prev, current) => {
    if (current.type === "mul" && enabled) {
      return prev + extractAndMultiplyNumbers(current.result);
    } else if (current.type === "do") {
      enabled = true;
    } else if (current.type === "don't") {
      enabled = false;
    }
    return prev;
  }, 0);

  return { partOneResult, partTwoResult };
}

const partOneExpected = 161;
const partTwoExpected = 48;
const { partOneResult, partTwoResult } = getResult(getInputs("example.txt"));
console.assert(partOneExpected === partOneResult, {
  partOneExpected,
  partOneResult,
});
console.assert(partTwoExpected === partTwoResult, {
  partTwoExpected,
  partTwoResult,
});

const inputFile = "input.txt";
console.log(
  `the results for ${inputFile} are`,
  getResult(getInputs(inputFile)),
);
