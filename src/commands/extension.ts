import BotClient from "../client/client";
import BaseSlashCommand from "./command";

export default abstract class BaseExtension {
  private _commands: BaseSlashCommand[] = [];

  constructor(public readonly client: BotClient) {}

  public get commands(): ReadonlyArray<BaseSlashCommand> {
    return this._commands;
  }

  public addCommand(command: BaseSlashCommand) {
    this._commands.push(command);
  }

  public async initialize() {
    for (const command of this._commands) {
      await this.client.registerCommand(command);
    }
  }

  public async cleanUp() {}
}
