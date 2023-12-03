import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

const notSymbols = [".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

type NumberInRow = {
  number: number;
  index: number;
  rowIndex: number;
};

type SymbolInRow = {
  symbol: string;
  index: number;
  rowIndex: number;
};

type MapItemValue = {
  numbers: NumberInRow[];
  symbols: SymbolInRow[];
};

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

function isSymbolAdjacentToNumber(
  numItem: NumberInRow,
  symbolItem: SymbolInRow,
) {
  const isSymbolIndexAtOrOneToTheRightOfNumberIndex =
    symbolItem.index - numItem.index <=
      numItem.number.toString().length &&
    symbolItem.index - numItem.index >= 0;

  const isSymbolIndexDirectlyToTheLeftOfNumberIndex =
    numItem.index - symbolItem.index === 1;

  if (numItem.index === 0) {
    return isSymbolIndexAtOrOneToTheRightOfNumberIndex;
  } else {
    return isSymbolIndexAtOrOneToTheRightOfNumberIndex ||
      isSymbolIndexDirectlyToTheLeftOfNumberIndex;
  }
}

function getResult(input: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  const schematicMap = new Map<number, MapItemValue>();

  input.forEach((row, rowIndex) => {
    // extract numbers from row
    const numbersInCurrentRow: NumberInRow[] = Array.from(
      row.matchAll(/[0-9]+/g),
    ).map(
      (match) => {
        // type guard
        if (typeof match.index === "undefined") {
          throw new Error("bad matchAll data");
        }
        return {
          number: Number(match[0]),
          index: match.index,
          rowIndex,
        };
      },
    );
    // extract symbols (i.e., not numbers nor periods) from row
    const symbolsInCurrentRow: SymbolInRow[] = Array.from(row).map(
      (symbol, index) => {
        return { symbol, index, rowIndex };
      },
    ).filter(({ symbol }) => !notSymbols.includes(symbol));

    // save row data to map for easy future retrieval
    schematicMap.set(rowIndex, {
      numbers: numbersInCurrentRow,
      symbols: symbolsInCurrentRow,
    });

    // now that the row is properly scanned/indexed, we're going to perform an analysis of the previous row
    const previousRow = schematicMap.get(rowIndex - 1);
    if (typeof previousRow === "undefined") {
      // this means we're at row 0 and no analysis can be done so we move onto to the next row
      return;
    }

    // in order to properly check the previous row, we need to compare against the row before that
    const twoRowsBack = schematicMap.get(rowIndex - 2);
    const numbersTwoRowsBack = twoRowsBack?.numbers;
    const symbolsTwoRowsBack = twoRowsBack?.symbols;

    // perform analysis for part 1
    // (i.e., scan the previous row of numbers against its row + its adjacent rows of symbols)
    let numbersToCheck = previousRow.numbers;
    let symbolsToCheck = [...symbolsInCurrentRow, ...previousRow.symbols]
      .concat(
        typeof symbolsTwoRowsBack === "undefined" ? [] : symbolsTwoRowsBack,
      );

    numbersToCheck.forEach((numItem) => {
      const isValidPart = symbolsToCheck.some((symbolItem) => {
        return isSymbolAdjacentToNumber(numItem, symbolItem);
      });

      if (isValidPart) partOneResult += numItem.number;
    });

    // perform the same analysis against the last row of numbers
    // (lots of duplication here i know but it's late)
    if (rowIndex === input.length - 1) {
      numbersToCheck = numbersInCurrentRow;
      symbolsToCheck = [...symbolsInCurrentRow, ...previousRow.symbols];

      numbersToCheck.forEach((numItem) => {
        const isValidPart = symbolsToCheck.some((symbolItem) => {
          return isSymbolAdjacentToNumber(numItem, symbolItem);
        });

        if (isValidPart) partOneResult += numItem.number;
      });
    }

    // part 2 analysis — basically do the reverse of what we did in part 1
    // (i.e., scan the previous row of symbols against its row + its adjacent rows of numbers)
    numbersToCheck = [...numbersInCurrentRow, ...previousRow.numbers].concat(
      typeof numbersTwoRowsBack === "undefined" ? [] : numbersTwoRowsBack,
    );
    // only filter symbols for asterisks
    symbolsToCheck = previousRow.symbols.filter((symbol) =>
      symbol.symbol === "*"
    );

    symbolsToCheck.forEach((symbolItem) => {
      const adjacentNumbers = numbersToCheck.filter((numItem) => {
        return isSymbolAdjacentToNumber(numItem, symbolItem);
      });

      if (adjacentNumbers.length >= 2) {
        const gearRatio = adjacentNumbers.reduce((prev, current) => {
          return prev * current.number;
        }, 1);

        partTwoResult += gearRatio;
      }
    });

    // perform the same analysis against the last row of symbols
    // (lots of duplication here i know but it's late)
    if (rowIndex === input.length - 1) {
      numbersToCheck = [...numbersInCurrentRow, ...previousRow.numbers];
      symbolsToCheck = symbolsInCurrentRow.filter((symbol) =>
        symbol.symbol === "*"
      );

      symbolsToCheck.forEach((symbolItem) => {
        const gears = numbersToCheck.filter((numItem) => {
          return isSymbolAdjacentToNumber(numItem, symbolItem);
        });

        const gearRatio = gears.reduce((prev, current) => {
          return prev * current.number;
        }, 1);

        if (gears.length >= 2) partTwoResult += gearRatio;
      });
    }
  });

  return { partOneResult, partTwoResult };
}

const example = [
  "467..114..",
  "...*......",
  "..35..633.",
  "......#...",
  "617*......",
  ".....+.58.",
  "..592.....",
  "......755.",
  "...$.*....",
  ".664.598..",
];

const partOneExpected = 4361;
const partTwoExpected = 467835;
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
