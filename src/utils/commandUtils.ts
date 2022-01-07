import glob from "glob";
import path from "path";
import BotClient from "../utils/client";
import { ApplicationCommandManager, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export type RunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export interface ISlashCommand {
  builder: SlashCommandBuilder;
  run: (options: RunOptions) => Promise<void>;
}

export const commandsPath = path.join(__dirname, "../commands");

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
