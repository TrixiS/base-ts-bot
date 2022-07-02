import { Intents } from "discord.js";
import BotClient from "./client";
import CommandHandlerExtension from "./extensions/commandHandler";
import phrases from "./phrases";
import config from "./config";
import TestExtension from "./extensions/test";

// TODO: auto import extensions

async function main() {
  const client = new BotClient({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  });

  client.once("ready", async () => {
    await client.registerExtension(CommandHandlerExtension);

    console.log(phrases.default.botStarted(client));
  });

  await client.login(config.botToken);
}

// TODO: sigint handler with extensions unregistration
process.on("uncaughtException", (error) => {
  console.error(`${error.message}\n${error.stack}`);
});

main().then();
