import { GatewayIntentBits } from "discord.js";
import {
  BotClient,
  CommandHandlerExtension,
  importExtensions
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

// TODO: pass commands into extension's constructor

async function main() {
  const client = new BotClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  });

  client.once("ready", async () => {
    await client.registerExtension(CommandHandlerExtension);

    const extensionClasses = await importExtensions(
      constants.paths.extensionsPath
    );

    for (const Extension of extensionClasses) {
      await client.registerExtension(Extension);
      console.log(phrases.default.extensionLoaded(Extension.name));
    }

    console.log(phrases.default.botStarted(client));
  });

  await client.login(config.botToken);
}

// TODO: sigint handler with extensions unregistration
// TODO: move it to the error handler extension
process.on("uncaughtException", (error) => {
  console.error(`${error.message}\n${error.stack}`);
});

main().then();
