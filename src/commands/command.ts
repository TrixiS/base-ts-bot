import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import BotClient from "../client/client";
import BaseExtension from "./extension";
import { SubCommand } from "./subcommand";

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  private _subcommands: SubCommand[];

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

  public async checkInteraction(options: CommandRunOptions): Promise<boolean> {
    return true;
  }

  public addSubcommand(subcommand: SubCommand) {
    this._subcommands.push(subcommand);
  }

  public abstract run(options: CommandRunOptions): any;
}

export abstract class GuildOnlyCommand<
  TExtension extends BaseExtension = BaseExtension
> extends BaseSlashCommand<TExtension> {
  public async checkInteraction(options: CommandRunOptions): Promise<boolean> {
    return Boolean(options.interaction.guild && options.interaction.member);
  }
}

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

export type CommandCallback = (options: CommandRunOptions) => Promise<any>;
