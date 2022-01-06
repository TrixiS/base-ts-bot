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
  if (commandManager.cache.get(command.builder.name)) {
    return;
  }

  const commandJson = command.builder.toJSON();
  await commandManager.create(commandJson);
};
