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

  /**
   * Generates a map (i.e., an array of number arrays) for a given map name (e.g., `seed-to-soil map:`)
   */
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

  /**
   * Gets the destination for a given source and map
   * @param map an array of number arrays that is used for mapping
   * (e.g., `[[88 18 7], [18 25 70]]`)
   */
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

  /**
   * Gets locations for an array of seeds
   */
  function getLocations(
    seeds: number[],
  ): number[] {
    let currentSources = seeds;
    allMappers.forEach((map) => {
      currentSources = currentSources.map((source) => {
        return getDestination(source, map);
      });
    });
    return currentSources;
  }

  /**
   * Gets location for a single seed
   */
  function getLocation(
    seed: number,
  ): number {
    let currentSource = seed;
    allMappers.forEach((map) => {
      currentSource = getDestination(currentSource, map);
    });
    return currentSource;
  }

  const dirtySeeds = input[0];

  const partOneSeeds = dirtySeeds.split(": ")[1].split(" ").map(Number);
  const partOneLocations = getLocations(partOneSeeds);
  const partOneResult = Math.min(...partOneLocations);

  // part two
  let partTwoResult = Infinity;
  if (partOneSeeds.length % 2 !== 0) {
    throw new Error("uneven number of seeds");
  }

  // construct the seed values from the pairs
  for (let i = 0; i <= partOneSeeds.length / 2; i += 2) {
    const seedStart = partOneSeeds[i];
    const seedRange = partOneSeeds[i + 1];

    for (let j = 0; j < seedRange; j++) {
      // for each seed, determine its location and set that to the min
      const currentSeed = seedStart + j;
      const currentDestination = getLocation(currentSeed);
      if (currentDestination < partTwoResult) {
        partTwoResult = currentDestination;
      }
    }
  }

  return { partOneResult, partTwoResult };
}

const example = getInputs("example.txt");

const partOneExpected = 35;
const partTwoExpected = 46;
const { partOneResult, partTwoResult } = getResult(example);
console.assert(partOneExpected === partOneResult, {
  partOneExpected,
  partOneResult,
});
console.assert(partTwoExpected === partTwoResult, {
  partTwoExpected,
  partTwoResult,
});

// this took ~17 min to run on my MBP M1 Max
const inputFile = "input.txt";
console.log(
  `the results for ${inputFile} are`,
  getResult(getInputs(inputFile)),
);
