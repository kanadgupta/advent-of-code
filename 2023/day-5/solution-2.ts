import fs from "node:fs";
import path from "node:path";

// deno/ESM patch, https://stackoverflow.com/a/61829368
const __dirname = new URL(".", import.meta.url).pathname;

// probably not necessary since we could just regex search for words but w/e
const allMaps = [
  "seed-to-soil map:",
  "soil-to-fertilizer map:",
  "fertilizer-to-water map:",
  "water-to-light map:",
  "light-to-temperature map:",
  "temperature-to-humidity map:",
  "humidity-to-location map:",
] as const;

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
  const allMappers = allMaps.map((map) => getCleanMap(map));

  function getCleanMap(mapName: string) {
    const startingIndex = input.indexOf(mapName);
    if (startingIndex < 0) {
      throw new Error(`bad index for ${mapName}`);
    }

    let currentIndex = startingIndex + 1;
    const arr: [number, number, number][] = [];
    while (true) {
      const currentValue = input[currentIndex];
      if (!currentValue) {
        break;
      }

      const [destRangeStart, sourceRangeStart, rangeLength] = currentValue
        .split(
          " ",
        ).map(Number);

      arr.push([destRangeStart, sourceRangeStart, rangeLength]);
      currentIndex++;
    }

    return arr;
  }

  function getDestination(source: number, map: [number, number, number][]) {
    let mapResult = source;
    const matchingLine = map.find((line) => {
      const [_d, s, r] = line;
      return source >= s &&
        source < s + r;
    });
    if (matchingLine) {
      const [destRangeStart, sourceRangeStart] = matchingLine;
      mapResult = source - sourceRangeStart + destRangeStart;
    }

    return mapResult;
  }

  function getLocation(
    source: number,
  ): number {
    let currentSource = source;
    allMappers.forEach((map) => {
      currentSource = getDestination(currentSource, map);
    });
    return currentSource;
  }

  const dirtySeeds = input[0];
  const parsedSeeds = dirtySeeds.split(": ")[1].split(" ").map(Number);

  let result = Infinity;
  if (parsedSeeds.length % 2 !== 0) {
    throw new Error("uneven number of seeds");
  }

  for (let i = 0; i <= parsedSeeds.length / 2; i += 2) {
    const seedStart = parsedSeeds[i];
    const seedRange = parsedSeeds[i + 1];

    for (let j = 0; j < seedRange; j++) {
      const currentSeed = seedStart + j;
      const currentDestination = getLocation(currentSeed);
      if (currentDestination < result) {
        result = currentDestination;
      }
    }
  }

  return result;
}

const example = getInputs("example.txt");

const expected = 46;
const result = getResult(example);
console.assert(expected === result, {
  expected,
  result,
});

// this will spin infinitely oof
const inputFile = "input.txt";
console.log(
  `the results for ${inputFile} are`,
  getResult(getInputs(inputFile)),
);
