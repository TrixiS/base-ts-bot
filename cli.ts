import { exec } from "child_process";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  configFilepaths,
  configModel,
  getExistingConfigFilepaths,
} from "./src/config";
import constants from "./src/utils/constants";

function jumpToFile(filepath: string) {
  exec(`code ${filepath}`);
}

const generateExtensionCode = (
  extensionName: string
) => `import { BaseExtension, BotClient, eventHandler } from "@trixis/lib-ts-bot";

export default class ${extensionName}Extension extends BaseExtension {}`;

const generateCommandCode = (extensionName: string, name: string) => {
  const extensionClassName = `${extensionName}Extension`;
  const code = `import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import ${extensionClassName} from ".";
import {
  BaseSlashCommand,
  commandHandler,
  CommandContext
} from "@trixis/lib-ts-bot";
import phrases from "../../phrases";
import prisma from "../../utils/prisma";

export default class ${name}Command extends BaseSlashCommand<${extensionClassName}> {
  constructor(extension: ${extensionClassName}) {
    const builder = new SlashCommandBuilder()
      .setName("${name.toLowerCase()}")
      .setDescription("")
      .setDMPermission(false);
    
    super(extension, builder);
  }
  
  @commandHandler()
  async run({ interaction }: CommandContext) {
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
  const extensionDirPath = path.join(
    constants.paths.extensionsPath,
    toCamelCase(name)
  );

  return extensionDirPath;
}

function createExtension(name: string) {
  const extensionDirPath = path.join(
    constants.paths.extensionsPath,
    toCamelCase(name)
  );

  const extensionIndexFilepath = path.join(extensionDirPath, "index.ts");

  if (fs.existsSync(extensionDirPath)) {
    return extensionIndexFilepath;
  }

  fs.mkdirSync(extensionDirPath);
  fs.writeFileSync(extensionIndexFilepath, generateExtensionCode(name), {
    encoding: "utf-8",
  });

  return extensionIndexFilepath;
}

function createCommand(extensionName: string, commandName: string) {
  const extensionDirPath = getExtensionDirPath(extensionName);
  const commandFilePath = path.join(
    extensionDirPath,
    `${toCamelCase(commandName)}.command.ts`
  );

  if (fs.existsSync(commandFilePath)) {
    return commandFilePath;
  }

  fs.writeFileSync(
    commandFilePath,
    generateCommandCode(extensionName, commandName),
    {
      encoding: "utf-8",
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
      if (!fs.existsSync(constants.paths.extensionsPath)) {
        fs.mkdirSync(constants.paths.extensionsPath);

        console.log(
          "Extensions dir has been created ->",
          constants.paths.extensionsPath
        );
      }

      if (fs.existsSync(configFilepaths.development)) {
        return console.log(
          "Development config is already created ->",
          configFilepaths.development
        );
      }

      configModel.refreshFile(configFilepaths.development, {
        encoding: "utf-8",
      });

      console.log(
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
          write: { encoding: "utf-8" },
        })
      );

      console.log("Config files have been updated");
    }
  )
  .command(
    "refresh",
    "Refresh configs",
    (yargs) => yargs,
    (argv) => {
      configModel.refreshFile(configFilepaths.production, {
        encoding: "utf-8",
      });

      console.log("Production config file has been refreshed");
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
          describe: "Name to create an extension with (PascalCase)",
        })
        .option("jump", { boolean: true, default: false }),
    (argv) => {
      const extensionIndexFilePath = createExtension(argv.name);
      console.log("Extension has been created ->", extensionIndexFilePath);

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
          describe: "Name of the extension to create command in",
        })
        .positional("name", {
          demandOption: true,
          type: "string",
          describe: "Name to create a command with (PascalCase)",
        })
        .option("jump", { boolean: true, default: false }),
    (argv) => {
      const commandFilepath = createCommand(argv.ext, argv.name);
      console.log("Command has been created ->", commandFilepath);

      if (argv.jump) {
        jumpToFile(commandFilepath);
      }
    }
  )
  .help()
  .parse();
