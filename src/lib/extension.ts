import BotClient from "../client";
import BaseSlashCommand from "./command";

// TODO: make @event decorator for the extension methods.
//       like @event({ name: "eventName" })

export default abstract class BaseExtension {
  private _commands: BaseSlashCommand[] = [];

  constructor(public readonly client: BotClient) {}

  public get commands(): ReadonlyArray<BaseSlashCommand> {
    return this._commands;
  }

  public addCommand(command: BaseSlashCommand) {
    this._commands.push(command);
  }

  public async register() {
    for (const command of this._commands) {
      await this.client.registerCommand(command);
    }
  }

  public async cleanUp() {}
}
