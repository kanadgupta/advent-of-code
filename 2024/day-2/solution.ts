import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

type Trend = "" | "increasing" | "decreasing";

/**
 * Reads the file (must be in the same directory as this TS file)
 * and returns its contents as an array, split by line
 */
function getInputs(fileName: string) {
  const file = fs.readFileSync(
    path.resolve(__dirname, fileName),
    { "encoding": "utf-8" },
  );

  return file.trim().split("\n");
}

function determineSafety(levels: number[]) {
  let overallTrend: Trend = "";
  let isSafe = true;

  for (let i = 0; i < levels.length - 1; i += 1) {
    let currentTrend: Trend = "";
    const levelDifference = levels[i] - levels[i + 1];

    if (levelDifference > 0) {
      currentTrend = "decreasing";
    } else if (levelDifference < 0) {
      currentTrend = "increasing";
    }

    const levelDistance = Math.abs(levelDifference);

    if (
      // this checks if the trend (e.g., all increasing or all decreasing) is being respected
      (overallTrend && currentTrend !== overallTrend) ||
      // this ensures that the level difference requirement is being respected
      levelDistance < 1 || levelDistance > 3
    ) {
      isSafe = false;
    }

    overallTrend = currentTrend;
  }

  return isSafe;
}

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  input.forEach((report) => {
    const levels = report.split(" ").filter(Boolean).map(Number);

    let isSafe = determineSafety(levels);

    if (isSafe) {
      partOneResult += 1;
      partTwoResult += 1;
    }

    let i = 0;

    // go through each item in the array, removing one at a time and testing to see if it's safe
    while (!isSafe && i < levels.length) {
      const deleted = levels.splice(i, 1);
      isSafe = determineSafety(levels);
      levels.splice(i, 0, ...deleted);
      i += 1;
      if (isSafe) {
        partTwoResult += 1;
      }
    }
  });

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 2;
const partTwoExpected = 4;
const { partOneResult, partTwoResult } = getResult(example);
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
