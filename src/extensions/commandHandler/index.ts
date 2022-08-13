import BotClient from "../../client";
import BaseExtension from "../../lib/extension";
import eventHandler from "../../lib/eventHandler";
import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { runCallbackName } from "../../lib/command";

export default class CommandHandlerExtension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);
  }

  @eventHandler("interactionCreate")
  async commandInteractionHandler(interaction: Interaction) {
    if (
      (!interaction.isChatInputCommand() || !interaction.command) &&
      !interaction.isContextMenuCommand()
    ) {
      return;
    }

    const command = this.client.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    const runOptions = command.getRunOptions(interaction);

    if (!(await command.runChecks(runOptions))) {
      return;
    }

    const data = await command.getData(interaction);
    const runHandler = command.handlers.find(
      (handler) => handler.name === runCallbackName
    );

    const runDefaultHandler = async () => {
      if (!runHandler) {
        return;
      }

      return await runHandler.callback.call(command, runOptions, data);
    };

    if (!(interaction instanceof ChatInputCommandInteraction)) {
      return await runDefaultHandler();
    }

    const { group: subcommandGroup, name: subcommandName } =
      this.getSubcommandData(interaction);

    if (!subcommandName) {
      return await runDefaultHandler();
    }

    const subcommandHandler = command.handlers.find(
      (handler) =>
        handler.group === subcommandGroup && handler.name === subcommandName
    );

    await subcommandHandler?.callback.call(command, runOptions, data);
  }

  getSubcommandData(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getSubcommand(false);
    const group = name ? interaction.options.getSubcommandGroup(false) : null;
    return { group, name };
  }
}
