import BotClient from "./client";
import Config from "./config";
import CommandHandlerExtension from "./extensions/commandHandler";
import constants from "./utils/constants";
import phrases from "./phrases";
import { Intents } from "discord.js";

async function main() {
  const config = await Config.loadFirst(constants.rootPath);

  if (!config) {
    throw new Error("No config found");
  }

  const client = new BotClient(config, {
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });

  client.once("ready", async () => {
    await client.registerExtension(new CommandHandlerExtension(client));

    console.log(phrases.default.botStarted(client));
  });

  await client.login(config.botToken);
}

process.on("uncaughtException", (error) => {
  console.error(`${error.message}\n${error.stack}`);
});

main().then();
