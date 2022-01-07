import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Command } from "commander";
import { commandsPath } from "../utils/commandUtils";

type FilePath = string;

type CreateCommandOptions = {
  name: string;
  description: string;
};

type CLIOptions = CreateCommandOptions & {
  jump: boolean;
};

function parseCliOptions(): CLIOptions {
  const cli = new Command();

  cli.requiredOption("-n, --name <commandName>", "Name of a new command");
  cli.requiredOption(
    "-d, --description <commandDescription>",
    "Description of a command"
  );
  cli.option("-j, --jump", "Jump to a command file (VSCode only)");
  cli.parse(process.argv);

  return cli.opts();
}

function createCommandCode(options: CreateCommandOptions): string {
  const commandCode = `import { SlashCommandBuilder } from "@discordjs/builders";
import { ISlashCommand, RunOptions } from "../utils/commandUtils";

const builder = new SlashCommandBuilder();
builder.setName("${options.name}");
builder.setDescription("${options.description}");

const run = async ({ interaction }: RunOptions) => {
  // TODO: code
};

export default { builder, run } as ISlashCommand;`;

  return commandCode;
}

function createCommand(options: CreateCommandOptions): FilePath {
  const commandFilePath = path.join(commandsPath, `${options.name}.ts`);
  const commandCode = createCommandCode(options);
  fs.writeFileSync(commandFilePath, commandCode, { encoding: "utf-8" });
  return commandFilePath;
}

function main() {
  const options = parseCliOptions();
  const commandFilePath = createCommand(options);

  console.log(`Command created -> ${commandFilePath}`);

  if (options.jump) {
    exec(`code ${commandFilePath}`);
  }
}

main();
