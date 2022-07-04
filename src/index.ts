import { Intents } from "discord.js";
import BotClient from "./client";
import phrases from "./phrases";
import config from "./config";
import fs from "fs";
import path from "path";
import { ExtensionSubclass } from "./lib/types";
import { extensionsPath } from "./cli/utils";

function readExtensionDirPaths() {
  const paths = fs
    .readdirSync(extensionsPath)
    .map((p) => path.join(extensionsPath, p));

  const extensionPaths = paths.filter((p) => fs.lstatSync(p).isDirectory());
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
