import fs from "fs";
import path from "path";
import { jumpToFile, toCamelCase, getExtensionDirPath } from "./utils";
import { Command } from "commander";

const generateCommandCode = (extensionName: string, name: string) => {
  const extensionClassName = `${extensionName}Extension`;

  const code = `import Discord, { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import ${extensionClassName} from ".";
import BaseSlashCommand, { CommandRunOptions } from "../../lib/command";
import commandHandler from "../../lib/handler";
  
export default class ${name}Command extends BaseSlashCommand<${extensionClassName}> {
  constructor(extension: ${extensionClassName}) {
    const builder = new SlashCommandBuilder()
      .setName("${name.toLowerCase()}")
      .setDescription(""); // TODO: set command description here
    
    super(extension, builder);
  }
  
  @commandHandler()
  async run({ interaction }: CommandRunOptions<CommandInteraction>) {
    // TODO: code
  }
}`;

  return code;
};

function parseCliOptions(): CLIOptions {
  const cli = new Command();

  cli.requiredOption(
    "-e, --extension <extension>",
    "Extension to create command in (PascalCase)"
  );

  cli.requiredOption("-n, --name <name>", "Command name (PascalCase)");
  cli.option("-j --jump", "Jump to the extension file (VSCode only)");
  cli.parse(process.argv);

  return cli.opts();
}

function createCommand(extensionName: string, name: string) {
  const extensionDirPath = getExtensionDirPath(extensionName);
  const commandFilePath = path.join(
    extensionDirPath,
    `${toCamelCase(name)}.ts`
  );

  if (fs.existsSync(commandFilePath)) {
    return commandFilePath;
  }

  fs.writeFileSync(commandFilePath, generateCommandCode(extensionName, name), {
    encoding: "utf-8"
  });

  return commandFilePath;
}

function main() {
  const options = parseCliOptions();
  const extensionDirPath = getExtensionDirPath(options.extension);

  if (!fs.existsSync(extensionDirPath)) {
    throw new Error(`Extension ${options.extension} does not exist`);
  }

  const commandFilePath = createCommand(options.extension, options.name);

  console.log(`Command created -> ${commandFilePath}`);

  if (options.jump) {
    jumpToFile(commandFilePath);
  }
}

type CLIOptions = {
  extension: string;
  name: string;
  jump: boolean;
};

main();
