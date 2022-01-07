import { SlashCommandBuilder } from "@discordjs/builders";
import { ISlashCommand, RunOptions } from "../utils/commandUtils";

const builder = new SlashCommandBuilder();
builder.setName("ping");
builder.setDescription("hello");

const run = async ({ interaction }: RunOptions) => {
  await interaction.reply({ content: "Pong", ephemeral: true });
};

export default { builder, run } as ISlashCommand;
