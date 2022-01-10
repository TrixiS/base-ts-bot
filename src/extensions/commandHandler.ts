import BaseExtension from "../commands/extension";
import BotClient from "../client/client";

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

      await command.run({ client: this.client, interaction });
    });
  }
}
