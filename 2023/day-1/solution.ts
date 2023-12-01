import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

const file = fs.readFileSync(
  path.resolve(__dirname, "./input.txt"),
  { "encoding": "utf-8" },
);

const normalizedNumbers = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  // uncomment the following lines to get the second part of the answer
  // "one": "1",
  // "two": "2",
  // "three": "3",
  // "four": "4",
  // "five": "5",
  // "six": "6",
  // "seven": "7",
  // "eight": "8",
  // "nine": "9",
} as const;

function getInt(match: keyof typeof normalizedNumbers) {
  if (normalizedNumbers[match]) {
    return normalizedNumbers[match];
  } else {
    throw new Error(`yikes, bad match: ${match}`);
  }
}

const r = new RegExp(`${Object.keys(normalizedNumbers).join("|")}`, "g");

const calibrations = file.trim().split("\n");

let totalSum = 0;

calibrations.forEach((cal) => {
  // const asdf = r.exec(cal);
  const matches = Array.from(cal.matchAll(r));
  if (matches === null) {
    throw new Error(`no match found for ${cal}`);
  } else {
    const firstMatch = getInt(matches[0][0] as keyof typeof normalizedNumbers);
    const lastMatch = getInt(
      matches[matches.length - 1][0] as keyof typeof normalizedNumbers,
    );
    const currentNum = `${firstMatch}${lastMatch}`;
    totalSum += Number(currentNum);
  }
});

console.log("the total sum is", totalSum);
