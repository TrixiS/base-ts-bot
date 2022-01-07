import ISlashCommand from "../interfaces/ISlashCommand";
import glob from "glob";
import path from "path";
import { ApplicationCommandManager } from "discord.js";

const commandsPath = path.join(__dirname, "../commands");

export const loadCommands = (): ISlashCommand[] => {
  const commands: ISlashCommand[] = [];
  const commandsFilePattern = `${commandsPath}/*.ts`;

  glob(commandsFilePattern, async (_, files) => {
    for (const filepath of files) {
      const commandModule = await import(filepath);
      commands.push(commandModule.default);
    }
  });

  return commands;
};

export const registerCommand = async (
  commandManager: ApplicationCommandManager,
  command: ISlashCommand
) => {
  if (commandManager.cache.size === 0) {
    await commandManager.fetch();
  }

  const allCommands = Array.from(commandManager.cache.values());
  const sameNameCommand = allCommands.find(
    (c) => c.name === command.builder.name
  );

  if (sameNameCommand) {
    return;
  }

  const commandJson = command.builder.toJSON();
  await commandManager.create(commandJson);
};
