import BaseExtension from "../lib/extension";
import BotClient from "../client";
import { CommandInteraction } from "discord.js";
import { runCallbackName } from "../lib/command";

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
      const runHandler = command.handlers.find(
        (handler) => handler.name === runCallbackName
      );

      if (!(interaction instanceof CommandInteraction)) {
        if (!runHandler) {
          return;
        }

        return await runHandler.callback.call(command, runOptions, data);
      }

      const [subcommandGroup, subcommandName] =
        this.getSubcommandData(interaction);

      if (!subcommandName) {
        if (!runHandler) {
          return;
        }

        return await runHandler.callback.call(command, runOptions, data);
      }

      const subcommandHandler = command.handlers.find(
        (handler) =>
          handler.group === subcommandGroup && handler.name === subcommandName
      );

      await subcommandHandler?.callback.call(command, runOptions, data);
    });
  }

  getSubcommandData(interaction: CommandInteraction) {
    let name: string | undefined;
    let group: string | undefined;

    try {
      name = interaction.options.getSubcommand();
    } catch (e) {
      name = undefined;
    }

    if (name) {
      try {
        group = interaction.options.getSubcommandGroup();
      } catch (e) {
        group = undefined;
      }
    }

    return [group, name];
  }
}
