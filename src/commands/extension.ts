import BotClient from "../client/client";
import { ISlashCommand } from "./command";

export default abstract class BaseExtension {
  private _commands: ISlashCommand[];

  constructor(public readonly client: BotClient, ...commands: ISlashCommand[]) {
    this._commands = commands;
  }

  public get commands(): ReadonlyArray<ISlashCommand> {
    return this._commands;
  }

  public async initialize() {
    for (const command of this._commands) {
      await this.client.registerCommand(command);
    }
  }

  public async cleanUp() {}
}
