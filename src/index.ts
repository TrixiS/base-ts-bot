import { Intents } from "discord.js";
import BotClient from "./client";
import phrases from "./phrases";
import config from "./config";
import fs from "fs";
import path from "path";
import { ExtensionSubclass } from "./lib/types";

// TODO: DI in runtime
//       e. g. we have client.extensions (? make it Map<string, class> ?)
//       after startup we cat get all of those and then assing it in register
//       after that we could use it in extension classes like loggingExtension: LoggingExntesion

// TODO: LoggerExtension

// TODO: converters for commandHandler (they could be also transformers)

// TODO: pass commands into extension's constructor

function readExtensionDirPaths() {
  const extensionsPath = path.join(__dirname, "./extensions");

  const extensionPaths = fs
    .readdirSync(extensionsPath)
    .map((p) => path.join(extensionsPath, p))
    .filter((p) => fs.lstatSync(p).isDirectory());

  return extensionPaths;
}

async function importExtensions(): Promise<ExtensionSubclass[]> {
  const extensionDirPaths = readExtensionDirPaths();
  const extensionClasses: ExtensionSubclass[] = [];

  for (const extensionDirPath of extensionDirPaths) {
    const extensionClass = await import(extensionDirPath);
    extensionClasses.push(extensionClass.default);
  }

  return extensionClasses;
}

async function main() {
  const client = new BotClient({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  });

  client.once("ready", async () => {
    const extensionClasses = await importExtensions();

    for (const Extension of extensionClasses) {
      await client.registerExtension(Extension);
      console.log(`Loaded extension - ${Extension.name}`);
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
