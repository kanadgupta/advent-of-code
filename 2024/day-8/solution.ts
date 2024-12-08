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

function computePart1AntinodePositions(
  antenna1: [number, number],
  antenna2: [number, number],
  gridHeight: number,
  gridWidth: number,
): ([number, number] | null)[] {
  const distance: [number, number] = [
    antenna1[0] - antenna2[0],
    antenna1[1] - antenna2[1],
  ];

  const antinode1: [number, number] = [
    antenna1[0] + distance[0],
    antenna1[1] + distance[1],
  ];

  const antinode2: [number, number] = [
    antenna2[0] - distance[0],
    antenna2[1] - distance[1],
  ];

  const [finalAntinode1, finalAntinode2] = [
    antinode1,
    antinode2,
  ].map(
    (ant) => {
      if (ant[0] < 0 || ant[1] < 0) return null;
      if (ant[0] >= gridHeight || ant[1] >= gridWidth) return null;
      return ant;
    },
  );

  return [finalAntinode1, finalAntinode2];
}

function computePart2AntinodePositions(
  antenna1: [number, number],
  antenna2: [number, number],
  gridHeight: number,
  gridWidth: number,
): [number, number][] {
  const distance: [number, number] = [
    antenna1[0] - antenna2[0],
    antenna1[1] - antenna2[1],
  ];

  const antinodes: [number, number][] = [];

  let currentRowIndex = antenna2[0];
  let currentColIndex = antenna2[1];

  do {
    currentRowIndex = currentRowIndex + distance[0];
    currentColIndex = currentColIndex + distance[1];
    if (
      currentRowIndex >= 0 && currentColIndex >= 0 &&
      currentRowIndex < gridHeight && currentColIndex < gridWidth
    ) {
      antinodes.push([currentRowIndex, currentColIndex]);
    }
  } while (
    currentRowIndex >= 0 && currentColIndex >= 0 &&
    currentRowIndex < gridHeight && currentColIndex < gridWidth
  );

  currentRowIndex = antenna1[0];
  currentColIndex = antenna1[1];

  // same while loop in the other direction
  do {
    currentRowIndex = currentRowIndex - distance[0];
    currentColIndex = currentColIndex - distance[1];
    if (
      currentRowIndex >= 0 && currentColIndex >= 0 &&
      currentRowIndex < gridHeight && currentColIndex < gridWidth
    ) {
      antinodes.push([currentRowIndex, currentColIndex]);
    }
  } while (
    currentRowIndex >= 0 && currentColIndex >= 0 &&
    currentRowIndex < gridHeight && currentColIndex < gridWidth
  );

  return antinodes;
}

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  const antenna: Record<string, [number, number][]> = {};

  const partOneAntinodes: [number, number][] = [];
  const partTwoAntinodes: [number, number][] = [];

  const gridHeight = input.length;
  const gridWidth = input[0].length;

  input.forEach((row, rowIndex) => {
    // build antenna list
    Array.from(row).forEach((char, colIndex) => {
      if (char !== ".") {
        if (antenna[char]) {
          antenna[char].push([rowIndex, colIndex]);
        } else {
          antenna[char] = [[rowIndex, colIndex]];
        }
      }
    });
  });

  Object.entries(antenna).forEach(([_freq, locations]) => {
    // compare each antenna for a given frequency against each other (probably excessively so?)
    locations.forEach((loc1, i1, locationsAgain) => {
      locationsAgain.forEach((loc2, i2) => {
        if (i1 !== i2) {
          // part 1
          const currentPartOneAnts = computePart1AntinodePositions(
            loc1,
            loc2,
            gridHeight,
            gridWidth,
          );

          currentPartOneAnts.forEach((ant) => {
            // if the antinode is valid and doesn't already exist in the list, add it!
            if (
              ant &&
              !partOneAntinodes.some((existingAnt) =>
                existingAnt[0] === ant[0] && existingAnt[1] === ant[1]
              )
            ) {
              partOneAntinodes.push(ant);
            }
          });

          // part 2 — slightly different logic for computing antinodes, otherwise identical to part 1
          const currentPartTwoAnts = computePart2AntinodePositions(
            loc1,
            loc2,
            gridHeight,
            gridWidth,
          );

          currentPartTwoAnts.forEach((ant) => {
            // if the antinode is valid and doesn't already exist in the list, add it!
            if (
              ant &&
              !partTwoAntinodes.some((existingAnt) =>
                existingAnt[0] === ant[0] && existingAnt[1] === ant[1]
              )
            ) {
              partTwoAntinodes.push(ant);
            }
          });
        }
      });
    });
  });

  partOneResult = partOneAntinodes.length;
  partTwoResult = partTwoAntinodes.length;

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 14;
const partTwoExpected = 34;
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
