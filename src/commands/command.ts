import BotClient from "../client";
import BaseExtension from "./extension";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandCheck } from "./checkFactory";
import { SubCommand } from "./subcommand";
import DefaultMap from "./defaultMap";

// TODO: decide how to implement options parsing (push them into CommandRunOptions.options)

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  protected static _subcommands: DefaultMap<string, SubCommand[]> =
    new DefaultMap(() => []);

  protected static _checks: DefaultMap<string, CommandCheck[]> = new DefaultMap(
    () => []
  );

  constructor(
    public readonly extension: TExtension,
    public readonly builder:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
  ) {}

  protected _getChecks(): CommandCheck[] {
    return BaseSlashCommand._checks.get(this.constructor.name);
  }

  protected _getSubcommands(): SubCommand[] {
    return BaseSlashCommand._subcommands.get(this.constructor.name);
  }

  public get checks(): ReadonlyArray<CommandCheck> {
    return this._getChecks();
  }

  public get subcommands(): ReadonlyArray<SubCommand> {
    return this._getSubcommands();
  }

  public addSubcommand(subcommand: SubCommand) {
    this._getSubcommands().push(subcommand);
  }

  public addCheck(check: CommandCheck) {
    this._getChecks().push(check);
  }

  public async runChecks(options: CommandRunOptions): Promise<boolean> {
    const checks = this._getChecks();

    for (const check of checks) {
      if (!(await check(options))) {
        return false;
      }
    }

    return true;
  }

  public async run(options: CommandRunOptions): Promise<any> {}
}

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export type CommandCallback = (options: CommandRunOptions) => Promise<any>;
