# Quick developer guide

## Setup

1. Use pnpm `npm i pnpm -g`
2. Install deps `pnpm install`
3. Init dev environment `pnpm cli dev`
4. Use dev config file `config-dev.json` (won't be shipped to git repo)

## CLI

CLI is used to create extensions and commands. Also for config updating/refreshing

```pnpm cli --help```

The following creates an **extension** called `Test` and a **command** called `Test` within that extension

```console
pnpm cli ext Test
pnpm cli cmd Test Test --jump
```

Add `--jump` option to jump to the command file in VS Code (just runs `code {commandFilePath}` in shell)

This we would have after those 2 commands execution
```
src/extensions/test/index.ts
src/extensions/test/test.command.ts
```

Extensions could have multiple commands
