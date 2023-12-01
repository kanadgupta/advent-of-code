# Advent of Code 2023

My 2023 stack of choice is Deno + TypeScript. This might change in future years.

To run these solutions, you'll have to have Deno 1.x installed. I'm using Deno 1.38.4.

```sh
deno run --allow-read [path-to-solution].ts
```

As of this writing, you should also be able to use Node (v18 or later, I think?) and run the files with [`tsx`](https://github.com/privatenumber/tsx):

```sh
npx tsx [path-to-solution].ts
```

Unfortunately Node + `ts-node` requires a lot of boilerplate configuration files + installed types that feel excessive for this exercise.
