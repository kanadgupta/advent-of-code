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

function getHorizontalMatches(row: string) {
  const forward = /XMAS/g;
  const reverse = /SAMX/g;

  let count = 0;
  let forwardMatch: RegExpExecArray | null = null;
  let reverseMatch: RegExpExecArray | null = null;

  do {
    forwardMatch = forward.exec(row);
    if (forwardMatch) count += 1;
  } while (forwardMatch);

  do {
    reverseMatch = reverse.exec(row);
    if (reverseMatch) count += 1;
  } while (reverseMatch);

  return count;
}

function getVerticalMatches(
  row1: string,
  row2: string,
  row3: string,
  row4: string,
) {
  // if any of these rows are undefined, then we don't need to search at all
  if (
    row1 === undefined || row2 === undefined || row3 === undefined ||
    row4 === undefined
  ) {
    return 0;
  }

  let count = 0;
  // iterate thru each column from left to right
  for (let i = 0; i < row1.length; i += 1) {
    if (
      // top-to-bottom match
      row1[i] === "X" && row2[i] === "M" && row3[i] === "A" &&
      row4[i] === "S"
    ) {
      count += 1;
    } else if (
      // bottom-to-top match
      row4[i] === "X" && row3[i] === "M" && row2[i] === "A" &&
      row1[i] === "S"
    ) {
      count += 1;
    }

    if (
      // diagonal top-left to bottom-right match
      row1[i] === "X" && row2[i + 1] === "M" &&
      row3[i + 2] === "A" && row4[i + 3] === "S"
    ) {
      count += 1;
    } else if (
      // diagonal bottom-right to top-left match
      row4[i + 3] === "X" && row3[i + 2] === "M" && row2[i + 1] === "A" &&
      row1[i] === "S"
    ) {
      count += 1;
    }

    if (
      // diagonal bottom-left to top-right match
      row4[i] === "X" && row3[i + 1] === "M" &&
      row2[i + 2] === "A" && row1[i + 3] === "S"
    ) {
      count += 1;
    } else if (
      // diagonal top-right to bottom-left match
      row1[i + 3] === "X" && row2[i + 2] === "M" &&
      row3[i + 1] === "A" && row4[i] === "S"
    ) {
      count += 1;
    }
  }

  return count;
}

function getMas(row1: string, row2: string, row3: string) {
  // if any of these rows are undefined, then we don't need to search at all
  if (
    row1 === undefined || row2 === undefined || row3 === undefined
  ) {
    return 0;
  }

  let count = 0;

  // iterate thru each column from left to right
  for (let i = 0; i < row1.length; i += 1) {
    if (row2[i + 1] === "A") {
      if (
        // check top-left to bottom-right diagonal
        (row1[i] === "M" && row3[i + 2] === "S") ||
        (row1[i] === "S" && row3[i + 2] === "M")
      ) {
        if (
          // check bottom-left to top-right diagonal
          (row1[i + 2] === "M" && row3[i] === "S") ||
          (row1[i + 2] === "S" && row3[i] === "M")
        ) {
          count += 1;
        }
      }
    }
  }

  return count;
}

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  input.forEach((row, i) => {
    partOneResult += getHorizontalMatches(row);

    partOneResult += getVerticalMatches(
      input[i],
      input[i + 1],
      input[i + 2],
      input[i + 3],
    );

    partTwoResult += getMas(input[i], input[i + 1], input[i + 2]);
  });

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 18;
const partTwoExpected = 9;
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
