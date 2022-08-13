import * as path from "path";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  configModel,
  configFilepaths,
  getExistingConfigFilepaths
} from "./src/config";
import constants from "./src/utils/constants";
import { exec } from "child_process";

// TODO:
// move cli.ts into deps
// dynamically import configMode, ...

const extensionsPath = path.join(constants.rootPath, "./src/extensions");

function jumpToFile(filepath: string) {
  exec(`code ${filepath}`);
}

const generateExtensionCode = (
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

const generateCommandCode = (extensionName: string, name: string) => {
  const extensionClassName = `${extensionName}Extension`;

  const code = `import Discord, { CommandInteraction, SlashCommandBuilder } from "discord.js";
import ${extensionClassName} from ".";
import BaseSlashCommand, { CommandRunOptions } from "../../lib/command";
import commandHandler from "../../lib/handler";
  
export default class ${name}Command extends BaseSlashCommand<${extensionClassName}> {
  constructor(extension: ${extensionClassName}) {
    const builder = new SlashCommandBuilder()
      .setName("${name.toLowerCase()}")
      .setDescription(""); // TODO: description
    
    super(extension, builder);
  }
  
  @commandHandler()
  async run({ interaction }: CommandRunOptions<CommandInteraction>) {
    // TODO: code
  }
}`;

  return code;
};

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

function getExtensionDirPath(name: string) {
  const extensionDirPath = path.join(extensionsPath, toCamelCase(name));
  return extensionDirPath;
}

function createExtension(name: string) {
  const extensionDirPath = path.join(extensionsPath, toCamelCase(name));
  const extensionIndexFilepath = path.join(extensionDirPath, "index.ts");

  if (fs.existsSync(extensionDirPath)) {
    return extensionIndexFilepath;
  }

  fs.mkdirSync(extensionDirPath);
  fs.writeFileSync(extensionIndexFilepath, generateExtensionCode(name), {
    encoding: "utf-8"
  });

  return extensionIndexFilepath;
}

function createCommand(extensionName: string, commandName: string) {
  const extensionDirPath = getExtensionDirPath(extensionName);
  const commandFilePath = path.join(
    extensionDirPath,
    `${toCamelCase(commandName)}.ts`
  );

  if (fs.existsSync(commandFilePath)) {
    return commandFilePath;
  }

  fs.writeFileSync(
    commandFilePath,
    generateCommandCode(extensionName, commandName),
    {
      encoding: "utf-8"
    }
  );

  return commandFilePath;
}

yargs(hideBin(process.argv))
  .command(
    "dev",
    "Create dev config",
    (yargs) => yargs,
    (argv) => {
      configModel.refreshFile(configFilepaths.development, {
        encoding: "utf-8"
      });

      console.info(
        "Development config has been created ->",
        configFilepaths.development
      );
    }
  )
  .command(
    "update",
    "Update configs",
    (yargs) => yargs,
    (argv) => {
      getExistingConfigFilepaths().forEach((filepath) =>
        configModel.updateFile(filepath, {
          read: { encoding: "utf-8" },
          write: { encoding: "utf-8" }
        })
      );

      console.info("Config files have been updated");
    }
  )
  .command(
    "refresh",
    "Refresh configs",
    (yargs) => yargs,
    (argv) => {
      configModel.refreshFile(configFilepaths.production, {
        encoding: "utf-8"
      });

      console.info("Production config file has been refreshed");
    }
  )
  .command(
    "ext [name]",
    "Create an extension",
    (yargs) =>
      yargs
        .positional("name", {
          demandOption: true,
          type: "string",
          describe: "Name to create an extension with (PascalCase)"
        })
        .option("jump", { boolean: true, default: false }),
    (argv) => {
      const extensionIndexFilePath = createExtension(argv.name);
      console.info("Extension has been created ->", extensionIndexFilePath);

      if (argv.jump) {
        jumpToFile(extensionIndexFilePath);
      }
    }
  )
  .command(
    "cmd [ext] [name]",
    "Create a command",
    (yargs) =>
      yargs
        .positional("ext", {
          demandOption: true,
          type: "string",
          describe: "Name of the extension to create command in"
        })
        .positional("name", {
          demandOption: true,
          type: "string",
          describe: "Name to create a command with (PascalCase)"
        })
        .option("jump", { boolean: true, default: false }),
    (argv) => {
      const commandFilepath = createCommand(argv.ext, argv.name);
      console.info("Command has been created ->", commandFilepath);

      if (argv.jump) {
        jumpToFile(commandFilepath);
      }
    }
  )
  .parse();
