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

  return file.trim().split("\n");
}

function getNumberOfWins(time: number, recordDistance: number): number {
  let count = 0;
  for (let buttonHoldTime = 1; buttonHoldTime < time; buttonHoldTime++) {
    // this could definitely be consolidated but it's easier to follow this way
    const rate = buttonHoldTime;
    const travelTime = time - buttonHoldTime;
    const totalDistance = rate * travelTime;
    if (totalDistance > recordDistance) {
      count++;
    }
  }
  return count;
}

function getResult(input: string[]) {
  // part one
  const partOneTimes = input[0].split(/[ ]+/g).slice(1).map(Number);
  const partOneDistances = input[1].split(/[ ]+/g).slice(1).map(Number);
  const partOneResult = partOneTimes.reduce(
    (prev, currentTime, currentIndex) => {
      const currentDistance = partOneDistances[currentIndex];
      const wins = getNumberOfWins(currentTime, currentDistance);
      return prev * wins;
    },
    1,
  );

  // part two
  const partTwoTime = Number(input[0].split(":")[1].replaceAll(" ", ""));
  const partTwoDistance = Number(input[1].split(":")[1].replaceAll(" ", ""));
  const partTwoResult = getNumberOfWins(partTwoTime, partTwoDistance);

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 288;
const partTwoExpected = 71503;
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
