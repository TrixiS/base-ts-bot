import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import ISlashCommand from "../interfaces/ISlashCommand";

const builder = new SlashCommandBuilder();
builder.setName("ping");
builder.setDescription("Pongs you");

const run = async (interaction: CommandInteraction) => {
  await interaction.reply({
    content: "Pong",
    ephemeral: true,
  });
};

export default { builder, run } as ISlashCommand;
