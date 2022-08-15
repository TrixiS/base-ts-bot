import { GatewayIntentBits } from "discord.js";
import {
  BotClient,
  CommandHandlerExtension,
  importAllExtensions
} from "@trixis/lib-ts-bot";
import { config } from "./config";
import phrases from "./phrases";
import constants from "./utils/constants";

// TODO: DI in runtime
//       e. g. we have client.extensions (? make it Map<string, class> ?)
//       after startup we cat get all of those and then assing it in register
//       after that we could use it in extension classes like loggingExtension: LoggingExntesion

// TODO: LoggerExtension

// TODO: converters for commandHandler (they could be also transformers)

async function main() {
  const client = new BotClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
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
      [...client.extensions.values()]
        .filter((extension) => extension.commands.length > 0)
        .map((extension) => ({
          [phrases.default.extension]: extension.constructor.name,
          [phrases.default.commands]: extension.commands.map(
            (command) => `/${command.builder!.name}`
          )
        }))
    );

    console.log(phrases.default.botStarted(client));
  });

  await client.login(config.botToken);
}

// TODO: sigint handler with extensions unregistration
// TODO: use just .error(error);
process.on("uncaughtException", (error) => {
  console.error(`${error.message}\n${error.stack}`);
});

main().then();
