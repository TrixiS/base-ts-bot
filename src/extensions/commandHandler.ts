import BaseExtension from "../commands/extension";
import BotClient from "../client/client";
import { CommandRunOptions } from "../commands/command";

export default class CommandHandlerExtension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand() || !interaction.command) {
        return;
      }

      const command = this.client.commands.get(interaction.command.name);

      if (!command) {
        return;
      }

      const runOptions: CommandRunOptions = { client, interaction };

      if (!(await command.checkInteraction(runOptions))) {
        return;
      }

      let subcommandsGroup: string | undefined;
      let subcommandName: string | undefined;

      try {
        subcommandName = interaction.options.getSubcommand();
      } catch {
        return await command.run(runOptions);
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

      await subcommand?.callback.call(command, runOptions);
    });
  }
}
