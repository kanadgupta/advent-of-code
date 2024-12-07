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

/**
 * For a given row (i.e., components/result) and a radix (e.g., 2 for part 1, 3 for part 2),
 * iterates through every possible permutation of operators (thanks to that radix representation)
 * to calculate a potential result. If it matches the original result, it exits the while loop
 * and returns that result.
 */
function getResultMatch(components: number[], result: number, radix: number) {
  let currentResult = -1;
  let radixCount = 0;

  while (
    currentResult !== result &&
    // `radix ** (components.length - 1)` is the ceiling for the number of possible operation permutations.
    // pleasantly surprised that i figured this out tbh
    radixCount < (radix ** (components.length - 1))
  ) {
    // takes the current radix count and turns it into a zero padded string.
    // e.g., for a components length of 4, the ceiling for the binary count is 7, 0 becomes '000' and 7 becomes '111'
    const radixString = radixCount.toString(radix).padStart(
      components.length - 1,
      "0",
    );

    // we take the binary string, split it character into an array,
    // and then for each character we determine the result using the character's corresponding operator
    currentResult = Array.from(radixString).reduce<number>(
      (prev, current, i) => {
        // 0 = sum
        if (current === "0") {
          return prev + components[i + 1];
        }
        // 1 = multiply
        if (current === "1") {
          return prev * components[i + 1];
        }
        // 2 = aggregate
        return Number(`${prev.toString()}${components[i + 1].toString()}`);
      },
      components[0],
    );

    radixCount += 1;
  }

  return currentResult;
}

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  input.forEach((row) => {
    if (!row) return;

    const [rawResult, rawComponents] = row.split(": ");

    const [result, components] = [
      Number(rawResult),
      rawComponents.split(" ").map(Number),
    ];

    if (getResultMatch(components, result, 2) === result) {
      partOneResult += result;
    }

    if (getResultMatch(components, result, 3) === result) {
      partTwoResult += result;
    }
  });

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 3749;
const partTwoExpected = 11387;
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
