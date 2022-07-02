import BotClient from "../client";
import BaseSlashCommand from "./command";
import DefaultMap from "./defaultMap";
import { EventHandler } from "./eventHandler";
import { CommandSubclass } from "./types";

export default class BaseExtension {
  private static _eventHandlers: DefaultMap<string, EventHandler<any>[]> =
    new DefaultMap(() => []);

  private _commands: BaseSlashCommand[] = [];

  constructor(public readonly client: BotClient) {
    this._registerEventHandlers();
  }

  private _getEventHandlers(): EventHandler<any>[] {
    return BaseExtension._eventHandlers.get(this.constructor.name);
  }

  private _registerEventHandlers() {
    const eventHandlers = this._getEventHandlers();

    for (const eventHandler of eventHandlers) {
      this.client.on(eventHandler.event, eventHandler.listener);
    }
  }

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
