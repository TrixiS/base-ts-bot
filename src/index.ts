import "reflect-metadata";
import { GatewayIntentBits } from "discord.js";
import { BotClient, CommandHandlerExtension } from "@trixis/lib-ts-bot";
import { config } from "./config";
import phrases from "./phrases";
import constants from "./utils/constants";
import { importAllExtensions } from "./utils/loader";

// TODO: converters for commandHandler (they could be also transformers)

const client = new BotClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  await client.registerExtension(CommandHandlerExtension);

  const extensionPayloads = await importAllExtensions(
    constants.paths.extensionsPath
  );

  await Promise.all(
    extensionPayloads.map((payload) =>
      client.registerExtension(payload.extensionClass, payload.commandClasses)
    )
  );

  console.table(
    [...client.extensions.values()].map((extension) => ({
      [phrases.default.extension]: extension.constructor.name,
      [phrases.default.commands]: extension.commands.map(
        (command) => `/${command.builder!.name}`
      ),
    }))
  );

  console.log(phrases.default.botStarted(client));
});

process.on("uncaughtException", (error) => {
  console.error(error);
});

client.login(config.botToken);
