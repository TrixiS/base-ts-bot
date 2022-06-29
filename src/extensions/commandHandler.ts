import BaseExtension from "../commands/extension";
import BotClient from "../client";
import { CommandInteraction } from "discord.js";

export default class CommandHandlerExtension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);

    client.on("interactionCreate", async (interaction) => {
      if (
        (!interaction.isCommand() || !interaction.command) &&
        !interaction.isContextMenu()
      ) {
        return;
      }

      const command = this.client.commands.get(interaction.commandName);

      if (!command) {
        return;
      }

      const runOptions = command.getRunOptions(interaction);
      const data = await command.getData(interaction);

      if (!(interaction instanceof CommandInteraction)) {
        return await command.run(runOptions, data);
      }

      let subcommandsGroup: string | undefined;
      let subcommandName: string | undefined;

      try {
        subcommandName = interaction.options.getSubcommand();
      } catch {
        return await command.run(runOptions, data);
      }

      try {
        subcommandsGroup = interaction.options.getSubcommandGroup();
      } catch {
        subcommandsGroup = undefined;
      }

      const subcommand = command.subcommands.find(
        (subcommand) =>
          subcommand.group === subcommandsGroup &&
          subcommand.name === subcommandName
      );

      await subcommand?.callback.call(command, runOptions, data);
    });
  }
}
