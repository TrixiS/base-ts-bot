import { Client, ClientOptions } from "discord.js";
import { Config } from "./config";

export default class BotClient extends Client {
  constructor(public config: Config, options: ClientOptions) {
    super(options);
  }
}
