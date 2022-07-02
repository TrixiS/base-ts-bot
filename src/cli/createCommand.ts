import fs from "fs";
import path from "path";
import { extensionsPath, jumpToFile, toCamelCase } from "./utils";
import { Command } from "commander";

const commandCode = (
  name: string,
  description: string
) => `class ${name}Command extends BaseSlashCommand {
  constructor(extension: BaseExtension) {
    const builder = new SlashCommandBuilder()
      .setName("${name.toLowerCase()}")
      .setDescription("${description}");
    
    super(extension, builder);
  }
  
  @commandHandler()
  async run({ interaction }: CommandRunOptions<CommandInteraction>) {
    // TODO: code
  }
}`;

function parseCliOptions(): CLIOptions {
  const cli = new Command();

  cli.requiredOption(
    "-e, --extension <extension>",
    "Extension to create command in (name of the extension file)"
  );

  cli.requiredOption("-n, --name <name>", "Command name (in PascalCase)");
  cli.option("-j --jump", "Jump to the extension file (VSCode only)");
  cli.parse(process.argv);

  return cli.opts();
}

function appendCommandCodeToFile(options: CLIOptions, filepath: string) {
  const code = commandCode(options.name, "description");
  fs.appendFileSync(filepath, `\n\n${code}`, { encoding: "utf-8" });
}

function main() {
  const options = parseCliOptions();

  const extensionNameCamel = toCamelCase(options.extension);
  const extensionFileName = extensionNameCamel.endsWith(".ts")
    ? extensionNameCamel
    : `${extensionNameCamel}.ts`;

  const extensionPath = path.join(extensionsPath, extensionFileName);

  if (!fs.existsSync(extensionPath)) {
    throw new Error(`Extension ${extensionFileName} does not exist`);
  }

  appendCommandCodeToFile(options, extensionPath);

  console.log(`Command created -> ${extensionPath}`);

  if (options.jump) {
    jumpToFile(extensionPath);
  }
}

type CLIOptions = {
  extension: string;
  name: string;
  jump: boolean;
};

main();
