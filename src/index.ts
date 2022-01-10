import BotClient from "./client/client";
import Config from "./client/config";
import CommandHandlerExtension from "./extensions/commandHandler";
import constants from "./utils/constants";
import phrases from "./utils/phrases";
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
