import BotClient from "../client/client";
import BaseExtension from "./extension";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandCheck } from "./checkFactory";
import { SubCommand } from "./subcommand";

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  protected _subcommands: SubCommand[];
  protected _checks: CommandCheck[] = [];

  constructor(
    public readonly extension: TExtension,
    public readonly builder:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
  ) {
    this._subcommands = this.getSubcommands();
  }

  private getSubcommands(): SubCommand[] {
    const subcommands: SubCommand[] = [];
    const propertyNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    );

    for (const propertyName of propertyNames) {
      const property = (this as any)[propertyName];

      if (!(property instanceof SubCommand)) {
        continue;
      }

      subcommands.push(property);
    }

    return subcommands;
  }

  public get subcommands(): ReadonlyArray<SubCommand> {
    return this._subcommands;
  }

  public get checks(): ReadonlyArray<CommandCheck> {
    return this._checks;
  }

  public addSubcommand(subcommand: SubCommand) {
    this._subcommands.push(subcommand);
  }

  public addCheck(check: CommandCheck) {
    this._checks.push(check);
  }

  public async runChecks(options: CommandRunOptions): Promise<boolean> {
    for (const check of this._checks) {
      if (!(await check(options))) {
        return false;
      }
    }

    return true;
  }

  public abstract run(options: CommandRunOptions): any;
}

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export type CommandCallback = (options: CommandRunOptions) => Promise<any>;
