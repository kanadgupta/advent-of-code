import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

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

function getSum(part: typeof part1, fileName: string) {
  const file = fs.readFileSync(
    path.resolve(__dirname, fileName),
    { "encoding": "utf-8" },
  );

  const calibrations = file.trim().split("\n");
  let totalSum = 0;

  calibrations.forEach((cal) => {
    const r = new RegExp(`${Object.keys(part).join("|")}`, "g");
    const matches = Array.from(cal.matchAll(r));
    if (matches === null) {
      throw new Error(`no match found for ${cal}`);
    } else {
      const firstMatch = part[matches[0][0] as keyof typeof part];
      /**
       * `String.prototype.matchAll()` doesn't handle overlapping matches properly
       * (e.g., we want `twone` to yield both `two` and `one` when instead it just finds
       *   `two`, which is a problem when trying to determine the last match),
       * so we grab the index of the last match, increment that by one,
       * and then search again using `RegExp.prototype.exec()`.
       * That way, we can ensure that we're accounting for the very last match
       * if it's different from the one that `String.prototype.matchAll()` finds.
       */
      const lastMatchIndexResult = matches[matches.length - 1];
      let lastMatch = part[lastMatchIndexResult[0] as keyof typeof part];
      const lastMatchIndexPlusOne = (lastMatchIndexResult.index as number) + 1;
      r.lastIndex = lastMatchIndexPlusOne;

      const asdf = r.exec(cal);
      if (asdf) {
        lastMatch = part[asdf[0] as keyof typeof part];
      }

      const currentNum = `${firstMatch}${lastMatch}`;
      totalSum += Number(currentNum);
    }
  });

  return totalSum;
}

const part1expected = 53334;
const part1result = getSum(part1, "input.txt");
console.log("the sum for part 1 is", part1result);
console.assert(part1result === part1expected, { part1result, part1expected });

const part2expected = 52834;
const part2result = getSum(part2, "input.txt");
console.log("the sum for part 2 is", part2result);
console.assert(part2result === part2expected, { part2result, part2expected });

const input2part1expected = 54990;
const input2part1result = getSum(part1, "input2.txt");
console.log("the sum for part 1 (input2.txt) is", input2part1result);
console.assert(input2part1expected === input2part1result, {
  input2part1expected,
  input2part1result,
});

const input2part2expected = 54473;
const input2part2result = getSum(part2, "input2.txt");
console.log("the sum for part 2 (input2.txt) is", input2part2result);
console.assert(input2part2expected === input2part2result, {
  input2part2expected,
  input2part2result,
});
