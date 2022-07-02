import BotClient from "../client";
import BaseSlashCommand from "./command";
import { CommandSubclass } from "./types";

// TODO: make @event decorator for the extension methods.
//       like @event({ name: "eventName" })

export default class BaseExtension {
  private _commands: BaseSlashCommand[] = [];

  constructor(public readonly client: BotClient) {}

  public get commands(): ReadonlyArray<BaseSlashCommand> {
    return this._commands;
  }

  public addCommand(Command: CommandSubclass) {
    const command = new Command(this);
    this._commands.push(command);
  }

  public async register() {
    for (const command of this._commands) {
      await this.client.registerCommand(command);
    }
  }

  public async unregister() {}
}
