import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default interface ISlashCommand {
  builder: SlashCommandBuilder;
  run: (interaction: CommandInteraction) => Promise<void>;
}
