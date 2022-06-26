import BotClient from "../client";
import BaseExtension from "./extension";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandCheck } from "./checkFactory";
import { SubCommand } from "./subcommand";

// TODO: decide how to implement options parsing (push them into CommandRunOptions.options)

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  @PrototypeField([])
  private _subcommands?: SubCommand[];

  @PrototypeField([])
  private _checks?: CommandCheck[];

  constructor(
    public readonly extension: TExtension,
    public readonly builder:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
  ) {}

  public get subcommands(): ReadonlyArray<SubCommand> {
    return this._subcommands ?? [];
  }

  public get checks(): ReadonlyArray<CommandCheck> {
    return this._checks ?? [];
  }

  public addSubcommand(subcommand: SubCommand) {
    this._subcommands?.push(subcommand);
  }

  public addCheck(check: CommandCheck) {
    this._checks?.push(check);
  }

  public async runChecks(options: CommandRunOptions): Promise<boolean> {
    if (!this._checks) {
      return true;
    }

    for (const check of this._checks) {
      if (!(await check(options))) {
        return false;
      }
    }

    return true;
  }

  public async run(options: CommandRunOptions): Promise<any> {}
}

function PrototypeField(defaultValue?: any) {
  return (target: any, propertyKey: string) => {
    const getter = () => {
      return defaultValue;
    };

    Reflect.defineProperty(target, propertyKey, { get: getter });
  };
}

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export type CommandCallback = (options: CommandRunOptions) => Promise<any>;
