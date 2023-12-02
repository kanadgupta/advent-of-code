import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

type possibleColor = "red" | "green" | "blue";

const MAX_RED = 12;
const MAX_GREEN = 13;
const MAX_BLUE = 14;

function getInputs(fileName: string) {
  const file = fs.readFileSync(
    path.resolve(__dirname, fileName),
    { "encoding": "utf-8" },
  );

  return file.trim().split("\n");
}

function getResult(games: string[]) {
  let partOneResult = 0;
  let partTwoResult = 0;

  games.forEach((game) => {
    const [dirtyGameNumber, dirtyGameResults] = game.split(": ");
    // grab the clean game number
    const gameNumber = Number(
      Array.from(dirtyGameNumber.matchAll(/[0-9]/g)).map((r) => r[0]).join(""),
    );

    // extract the number of cubes required for the current game into an object
    const requiredCubeCounts = dirtyGameResults.split("; ").reduce(
      (prevCleanRound, currentDirtyRound) => {
        const cleanRoundToReturn = { ...prevCleanRound };
        const currentCleanRound = { red: 0, green: 0, blue: 0 };

        // grab the count for each color and add it to the currentRound object
        currentDirtyRound.trim().split(", ").forEach((cube) => {
          const [dirtyCubeCount, dirtyCubeColor] = cube.split(" ");
          currentCleanRound[dirtyCubeColor.trim() as possibleColor] = Number(
            dirtyCubeCount,
          );
        });

        // compare the current round to the accumulated round values
        // and accumulate the maximum counts in the object that we return
        Object.keys(prevCleanRound).forEach((color) => {
          const typedColor = color as possibleColor;
          if (currentCleanRound[typedColor] > prevCleanRound[typedColor]) {
            cleanRoundToReturn[typedColor] = currentCleanRound[typedColor];
          }
        });

        return cleanRoundToReturn;
      },
      { red: 0, green: 0, blue: 0 },
    );

    if (
      requiredCubeCounts.red <= MAX_RED &&
      requiredCubeCounts.green <= MAX_GREEN &&
      requiredCubeCounts.blue <= MAX_BLUE
    ) {
      partOneResult += gameNumber;
    }

    partTwoResult += requiredCubeCounts.red * requiredCubeCounts.green *
    requiredCubeCounts.blue;
  });

  return { partOneResult, partTwoResult };
}

const exampleGames = [
  "Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green",
  "Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue",
  "Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red",
  "Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red",
  "Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green",
];

const partOneExpected = 8;
const partTwoExpected = 2286;
const { partOneResult, partTwoResult } = getResult(exampleGames);
console.assert(partOneExpected === partOneResult, { partOneExpected, partOneResult });
console.assert(partTwoExpected === partTwoResult, { partTwoExpected, partTwoResult });

console.log(
  "the results are",
  getResult(getInputs("input.txt")),
);
