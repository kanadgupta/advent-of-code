import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

const highCard = 1; // weakest
const onePair = 2;
const twoPair = 3;
const threeOfAKind = 4;
const fullHouse = 5;
const fourOfAKind = 6;
const fiveOfAKind = 7; // strongest

const cardRank = [
  "J",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "Q",
  "K",
  "A",
];

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

function whatIsTheHandType(hand: string) {
  const map = new Map<string, number>();
  const cardArr = Array.from(hand);
  cardArr.forEach((card) => {
    const currentCount = map.get(card);
    if (!currentCount) {
      map.set(card, 1);
    } else {
      map.set(card, currentCount + 1);
    }
  });

  const jokerCount = map.get("J");
  if (jokerCount && jokerCount < 5) {
    map.delete("J");
  }

  const arrayOfUniqueCounts = Array.from(map.values());
  const previousMaxValue = Math.max(...arrayOfUniqueCounts);

  if (jokerCount && jokerCount < 5) {
    arrayOfUniqueCounts.splice(
      arrayOfUniqueCounts.indexOf(previousMaxValue),
      1,
      previousMaxValue + jokerCount,
    );
  }

  const maxValue = Math.max(...arrayOfUniqueCounts);

  if (maxValue === 1) return highCard;
  if (maxValue === 2) {
    // one pair (A23A4) or two pair (23432)
    // if there are two twos, it's a two pair
    // else it's a one pair
    let numberOfTwos = 0;
    arrayOfUniqueCounts.forEach((count) => {
      if (count === 2) numberOfTwos++;
    });
    if (numberOfTwos === 1) return onePair;
    else return twoPair;
  }
  if (maxValue === 3) {
    // full house (23332) or three of a kind (TTT98)
    // if there is a pair, it's a full house
    // otherwise it's a three-of-a-kind
    let numberOfTwos = 0;
    arrayOfUniqueCounts.forEach((count) => {
      if (count === 2) numberOfTwos++;
    });
    if (numberOfTwos === 1) return fullHouse;
    else return threeOfAKind;
  }
  if (maxValue === 4) return fourOfAKind;
  if (maxValue === 5) return fiveOfAKind;
  else {
    throw Error(`this hand is weird: ${hand}`);
  }
}

function handOneMinusHandTwo(handOne: string, handTwo: string): number {
  const handOneType = whatIsTheHandType(handOne);
  const handTwoType = whatIsTheHandType(handTwo);

  if (handOneType !== handTwoType) {
    return handOneType - handTwoType;
  }

  let difference = 0;
  for (
    let currentCardIndex = 0;
    currentCardIndex < handOne.length;
    currentCardIndex++
  ) {
    const handOneCurrentCard = handOne[currentCardIndex];
    const handOneCurrentCardValue = cardRank.indexOf(handOneCurrentCard);
    if (handOneCurrentCardValue < 0) {
      throw new Error(`unexpected card: ${handOneCurrentCard}`);
    }
    const handTwoCurrentCard = handTwo[currentCardIndex];
    const handTwoCurrentCardValue = cardRank.indexOf(handTwoCurrentCard);
    if (handTwoCurrentCardValue < 0) {
      throw new Error(`unexpected card: ${handTwoCurrentCard}`);
    }

    if (handOneCurrentCardValue !== handTwoCurrentCardValue) {
      difference = handOneCurrentCardValue - handTwoCurrentCardValue;
      break;
    }
  }

  return difference;
}

function getResult(input: string[]) {
  let partTwoResult = 0;

  const cleanedInput = input.map((line) => {
    const [hand, dirtyBidAmount] = line.split(" ");
    const bidAmount = Number(dirtyBidAmount);
    return { hand, bidAmount };
  });

  cleanedInput.sort((handOne, handTwo) => {
    return handOneMinusHandTwo(handOne.hand, handTwo.hand);
  });

  partTwoResult = cleanedInput.reduce((prev, current, index) => {
    const asdf = current.bidAmount * (index + 1);
    return prev + asdf;
  }, 0);

  return { partTwoResult };
}

const example = getInputs("example.txt");

const partTwoExpected = 5905;
const { partTwoResult } = getResult(example);
console.assert(partTwoExpected === partTwoResult, {
  partTwoExpected,
  partTwoResult,
});

const inputFile = "input.txt";
console.log(
  `the results for ${inputFile} are`,
  getResult(getInputs(inputFile)),
);
