import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

const file = fs.readFileSync(
  path.resolve(__dirname, "./input.txt"),
  { "encoding": "utf-8" },
);

const part1 = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
} as const;

const part2 = {
  ...part1,
  "one": "1",
  "two": "2",
  "three": "3",
  "four": "4",
  "five": "5",
  "six": "6",
  "seven": "7",
  "eight": "8",
  "nine": "9",
} as const;

const calibrations = file.trim().split("\n");

function getSum(part: typeof part1) {
  let totalSum = 0;
  const r = new RegExp(`${Object.keys(part).join("|")}`, "g");

  calibrations.forEach((cal) => {
    const matches = Array.from(cal.matchAll(r));
    if (matches === null) {
      throw new Error(`no match found for ${cal}`);
    } else {
      const firstMatch = part[matches[0][0] as keyof typeof part];
      const lastMatch =
        part[matches[matches.length - 1][0] as keyof typeof part];
      const currentNum = `${firstMatch}${lastMatch}`;
      totalSum += Number(currentNum);
    }
  });

  return totalSum;
}

console.log("the sum for part 1 is", getSum(part1));
console.log("the sum for part 2 is", getSum(part2));
