import BaseExtension from "../commands/extension";
import BotClient from "../client";

export default class CommandHandlerExtension extends BaseExtension {
  constructor(client: BotClient) {
    super(client);

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand() || !interaction.command) {
        return;
      }

      const command = this.client.commands.get(interaction.command.name);
      const runOptions = await command?.getRunOptions(interaction);

      if (!command || !runOptions || !(await command.runChecks(runOptions))) {
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
