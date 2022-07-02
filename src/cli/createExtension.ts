import { Command } from "commander";
import fs from "fs";
import path from "path";
import { toCamelCase, extensionsPath, jumpToFile } from "./utils";

const extensionCode = (
  extensionName: string
) => `import Discord, { CommandInteraction } from "discord.js";
import BaseSlashCommand, { CommandRunOptions } from "../lib/command";
import BaseExtension from "../lib/extension";
import BotClient from "../client";
import commandHandler from "../lib/handler";
import eventHandler from "../lib/eventHandler";
import prisma from "../utils/prisma";
import phrases from "../phrases";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class ${extensionName}Extension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);
  }
}`;

function parseCliOptions(): CLIOptions {
  const cli = new Command();

  cli.requiredOption(
    "-n, --name <name>",
    "Name of an extension to create (in PascalCase)"
  );
  cli.option("-j --jump", "Jump to the extension file (VSCode only)");
  cli.parse(process.argv);

  return cli.opts();
}

function createExtensionFile(extensionName: string): string {
  const fileName = `${toCamelCase(extensionName)}.ts`;
  const extensionFilePath = path.join(extensionsPath, fileName);

  if (fs.existsSync(extensionFilePath)) {
    return extensionFilePath;
  }

  fs.writeFileSync(extensionFilePath, extensionCode(extensionName), {
    encoding: "utf-8"
  });

  return extensionFilePath;
}

function main() {
  const options = parseCliOptions();
  const extensionFilePath = createExtensionFile(options.name);

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
