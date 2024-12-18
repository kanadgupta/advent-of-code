# Advent of Code 2024

My 2024 stack of choice is Deno + TypeScript (again). This might change in future years.

To run these solutions, you'll have to have Deno 2.x installed. I'm using Deno 2.1.2.

```sh
deno run --allow-read [path-to-solution].ts
```

As of this writing, you should also be able to use Node (v18 or later, I think?) and run the files with [`tsx`](https://github.com/privatenumber/tsx):

```sh
npx tsx [path-to-solution].ts
```

Unfortunately Node + `ts-node` requires a lot of boilerplate configuration files + installed types that feel excessive for this exercise.

## Recommended Tooling

- VSCode
- [VSCode + Deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
