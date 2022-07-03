import { Command } from "commander";
import fs from "fs";
import path from "path";
import { toCamelCase, extensionsPath, jumpToFile } from "./utils";

const extensionCode = (
  extensionName: string
) => `import Discord from "discord.js";
import BaseExtension from "../../lib/extension";
import BotClient from "../../client";
import eventHandler from "../../lib/eventHandler";

export default class ${extensionName}Extension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);
  }
}`;

function parseCliOptions(): CLIOptions {
  const cli = new Command();

  cli.requiredOption(
    "-n, --name <name>",
    "Name of an extension to create (PascalCase)"
  );
  cli.option("-j --jump", "Jump to the extension file (VSCode only)");
  cli.parse(process.argv);

  return cli.opts();
}

function createExtension(extensionName: string) {
  const extensionDirPath = path.join(
    extensionsPath,
    toCamelCase(extensionName)
  );
  const exntesionIndexFilePath = path.join(extensionDirPath, "index.ts");

  if (fs.existsSync(extensionDirPath)) {
    return [extensionDirPath, exntesionIndexFilePath];
  }

  fs.mkdirSync(extensionDirPath);
  fs.writeFileSync(exntesionIndexFilePath, extensionCode(extensionName), {
    encoding: "utf-8"
  });

  return [extensionDirPath, exntesionIndexFilePath];
}

function main() {
  const options = parseCliOptions();
  const [_, extensionFilePath] = createExtension(options.name);

  console.log(`Extension created -> ${extensionFilePath}`);

  if (options.jump) {
    jumpToFile(extensionFilePath);
  }
}

type CLIOptions = {
  name: string;
  jump: boolean;
};

main();
