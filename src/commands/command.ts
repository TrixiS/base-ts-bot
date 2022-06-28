import Discord from "discord.js";
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

// TODO: interface for builder

// TODO: improve cmd/ext scripts, allow sub directories (pass all data in camelCase)

// TODO: add member and guild into command run options

// TODO: auto import prisma, phrases

// TODO: specify extension type in cmd script (optional)

// TODO: fix start scripts

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension,
  TRunOptionsData = DefaultRunOptionsData
> {
  private static _subcommands: DefaultMap<string, SubCommand[]> =
    new DefaultMap(() => []);

  private static _checks: DefaultMap<string, CommandCheck[]> = new DefaultMap(
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

  public async runChecks(
    options: CommandRunOptions<TRunOptionsData>
  ): Promise<boolean> {
    const checks = this._getChecks();

    for (const check of checks) {
      if (!(await check(options))) {
        return false;
      }
    }

    return true;
  }

  public async run(options: CommandRunOptions<TRunOptionsData>): Promise<any> {}

  public async getRunOptions(
    interaction: Discord.CommandInteraction
  ): Promise<CommandRunOptions<TRunOptionsData>> {
    const guild = interaction.guild ?? undefined;
    const member = guild?.members.cache.get(interaction.user.id);
    const data = await this.getData(interaction);

    return {
      interaction,
      guild,
      member,
      data,
      client: this.extension.client,
    };
  }

  public async getData(
    interaction: Discord.CommandInteraction
  ): Promise<TRunOptionsData> {
    return {} as any;
  }
}

export type DefaultRunOptionsData = Record<string, any>;

export type CommandRunOptions<TData = DefaultRunOptionsData> = {
  client: BotClient;
  interaction: CommandInteraction;
  member?: Discord.GuildMember;
  guild?: Discord.Guild;
  data: TData;
};

export type CommandCallback<TData = DefaultRunOptionsData> = (
  options: CommandRunOptions<TData>
) => Promise<any>;
