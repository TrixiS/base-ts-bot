import BaseExtension from "../commands/extension";
import { Client, ClientOptions } from "discord.js";
import { ISlashCommand } from "../commands/command";
import { ConfigType } from "./config";

export default class BotClient extends Client {
  private _config: ConfigType;
  private _commandManagerCacheFetched: boolean = false;
  private _extensions: BaseExtension[] = [];
  private _commands: Map<string, ISlashCommand> = new Map();

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

  public get commands(): ReadonlyMap<string, ISlashCommand> {
    return this._commands;
  }

  private async _isCommandRegistered(command: ISlashCommand): Promise<boolean> {
    const commandManager = this.application?.commands;

    if (!commandManager) {
      throw new Error(`Application command manager is ${commandManager}`);
    }

    if (commandManager.cache.size === 0) {
      if (!this._commandManagerCacheFetched) {
        await commandManager?.fetch();
        this._commandManagerCacheFetched = true;
      } else {
        return false;
      }
    }

    const allCommands = Array.from(commandManager.cache.values());
    const sameNameCommand = allCommands.find(
      (c) => c.name === command.builder.name
    );

    return sameNameCommand !== undefined;
  }

  public async registerCommand(command: ISlashCommand) {
    if (await this._isCommandRegistered(command)) {
      return this._commands.set(command.builder.name, command);
    }

    const commandJson = command.builder.toJSON();
    await this.application?.commands.create(commandJson);
    this._commands.set(command.builder.name, command);
  }

  public async registerExtension(extension: BaseExtension) {
    this._extensions.push(extension);
    await extension.initialize();
  }
}
