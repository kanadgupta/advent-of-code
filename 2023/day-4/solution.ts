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
 * parses the raw input from the file into usable data structures
 */
function extractGameInfo(dirtyCard: string) {
  const [dirtyCardNumber, dirtyResults] = dirtyCard.split(":");
  const cardNumber = Number(dirtyCardNumber.match(/\d+/)?.[0]);
  const [dirtyWinningNumbers, dirtyNumbersWeHave] = dirtyResults.trim().split(
    "|",
  );
  const winningNumbers = Array.from(dirtyWinningNumbers.matchAll(/\d+/g)).map(
    (x) => Number(x[0]),
  );
  const numbersWeHave = Array.from(dirtyNumbersWeHave.matchAll(/\d+/g)).map(
    (x) => Number(x[0]),
  );

  return {
    cardNumber,
    /** the winning numbers, as an array of integers */
    winningNumbers,
    /** the numbers on our card, as an array of integers */
    numbersWeHave,
  };
}

function getResult(input: string[]) {
  let partOneResult = 0;

  // get max card number, used in part two
  const { cardNumber: maxCardNumber } = extractGameInfo(
    input[input.length - 1],
  );

  // initialize a map, used in part two
  const map = new Map();
  // https://stackoverflow.com/a/33352604
  Array.from({ length: maxCardNumber }, (_, i) => i + 1).forEach((card) => {
    map.set(card, 1);
  });

  input.forEach((card) => {
    const { cardNumber, numbersWeHave, winningNumbers } = extractGameInfo(card);

    const numberOfMatches = numbersWeHave.reduce((prev, current) => {
      return winningNumbers.some((winningNum) => winningNum === current)
        ? prev + 1
        : prev;
    }, 0);

    // say we have 3 matches and the current card number is 6,
    // this weird li'l function will return [7, 8, 9]
    // used in part two
    const cardsWeWinCopiesOf = Array.from(
      { length: numberOfMatches },
      (_, i) => cardNumber + 1 + i,
    );

    // for each copy of the current card, we add on copies of the next cards
    // used in part two
    const numberOfCopiesOfCurrentCard = map.get(cardNumber);
    let copyIterator = 0;
    while (copyIterator < numberOfCopiesOfCurrentCard) {
      cardsWeWinCopiesOf.forEach((copy) => {
        map.set(copy, map.get(copy) + 1);
      });
      copyIterator++;
    }

    // if we have any matches, the equation for part one is 1 x 2^n where n is the number of matches minus 1
    partOneResult += numberOfMatches ? 1 * 2 ** (numberOfMatches - 1) : 0;
  });

  // sum up the values of the map to get the part two result
  const partTwoResult = Array.from(map.values()).reduce(
    (prev, current) => prev + current,
    0,
  );

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 13;
const partTwoExpected = 30;
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
