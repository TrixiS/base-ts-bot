import BaseExtension from "./commands/extension";
import BaseSlashCommand from "./commands/command";
import { Client, ClientOptions } from "discord.js";
import { ConfigType } from "./config";

export default class BotClient extends Client {
  private _config: ConfigType;
  private _extensions: BaseExtension[] = [];
  private _commands: Map<string, BaseSlashCommand> = new Map();

  constructor(config: ConfigType, options: ClientOptions) {
    super(options);
    this._config = config;
  }

  public get config(): ConfigType {
    return this._config;
  }

  public get extensions(): ReadonlyArray<BaseExtension> {
    return this._extensions;
  }

  public get commands(): ReadonlyMap<string, BaseSlashCommand> {
    return this._commands;
  }

  public async registerCommand(command: BaseSlashCommand) {
    const commandJson = command.builder.toJSON();
    await this.application?.commands.create(commandJson as any);
    this._commands.set(command.builder.name, command);
  }

  public async registerExtension(extension: BaseExtension) {
    this._extensions.push(extension);
    await extension.register();
  }
}