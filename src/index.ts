import { Client, Intents, Interaction } from "discord.js";
import { loadCommands, registerCommand } from "./utils/commandUtils";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const commands = loadCommands();

client.once("ready", () => {
  const commandsManager = client.application?.commands;

  commands.forEach((command) =>
    registerCommand(commandsManager as any, command)
  );
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    const command = commands.find(
      (command) => command.builder.name === interaction.commandName
    );

    if (!command) {
      return;
    }

    await command.run(interaction);
  }
});

client.login(process.env.BOT_TOKEN);
