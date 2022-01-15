import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import BotClient from "../client/client";

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export default abstract class BaseSlashCommand {
  constructor(public readonly builder: SlashCommandBuilder) {}

  public abstract run(options: CommandRunOptions): any;
}
