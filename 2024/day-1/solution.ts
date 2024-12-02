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

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  const leftList: number[] = [];
  const rightList: number[] = [];
  input.forEach((row) => {
    const [leftListItem, rightListItem] = row.split("   ").map((str) =>
      Number(str)
    );

    leftList.push(leftListItem);
    rightList.push(rightListItem);
  });

  leftList.sort();
  rightList.sort();

  partOneResult = leftList.reduce((prev, current, i) => {
    const distance = Math.abs(current - rightList[i]);
    return prev + distance;
  }, 0);

  partTwoResult = leftList.reduce((prev, current) => {
    const similarity = current *
      rightList.filter((item) => item === current).length;

    return prev + similarity;
  }, 0);

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 11;
const partTwoExpected = 31;
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
