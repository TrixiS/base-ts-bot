import { Intents, Interaction } from "discord.js";
import { loadCommands, registerCommand } from "./utils/commandUtils";
import phrases from "./utils/phrases";
import { loadConfig } from "./utils/config";
import BotClient from "./utils/client";

const client = new BotClient(loadConfig(), {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const commands = loadCommands();

client.once("ready", () => {
  const commandsManager = client.application?.commands;

  if (commandsManager) {
    commands.forEach((command) => registerCommand(commandsManager, command));
  }

  console.log(phrases.botStarted(client));
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    const command = commands.find(
      (command) => command.builder.name === interaction.commandName
    );

    if (command) {
      await command.run({ client, interaction });
    }
  }
});

client.login(client.config.botToken);
