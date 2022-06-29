import Discord from "discord.js";
import BotClient from "../client";
import BaseExtension from "./extension";
import { BaseCommandInteraction } from "discord.js";
import { CommandCheck } from "./checkFactory";
import { SubCommand } from "./subcommand";
import DefaultMap from "./defaultMap";

// TODO: decide how to implement options parsing (push them into CommandRunOptions.options)

// TODO: interface for builder

// TODO: improve cmd/ext scripts, allow sub directories (pass all data in camelCase)

// TODO: auto import prisma, phrases

// TODO: specify extension type in cmd script (optional)

// TODO: fix start scripts

// TODO: command type in scripts (user context, message, default, etc)

interface CommandBuilder {
  toJSON: () => any; // @discordjs/builders package developers are just fucking morons
  name: string; //      that could not make their useless builders library compatible with discord.js (event it is the main package)
  // so i have to break types and use any
}

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  private static _subcommands: DefaultMap<string, SubCommand[]> =
    new DefaultMap(() => []);

  private static _checks: DefaultMap<string, CommandCheck[]> = new DefaultMap(
    () => []
  );

  constructor(
    public readonly extension: TExtension,
    public readonly builder: CommandBuilder
  ) {}

  private _getChecks(): CommandCheck[] {
    return BaseSlashCommand._checks.get(this.constructor.name);
  }

  private _getSubcommands(): SubCommand[] {
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
    for (const check of this.checks) {
      if (!(await check(options))) {
        return false;
      }
    }

    return true;
  }

  public async getData(
    interaction: Discord.BaseCommandInteraction
  ): Promise<Record<string, any>> {
    return {};
  }

  public getRunOptions(
    interaction: Discord.BaseCommandInteraction
  ): CommandRunOptions {
    const guild = interaction.guild ?? undefined;
    const member = guild?.members.cache.get(interaction.user.id);

    return {
      interaction,
      member,
      guild,
      client: this.extension.client,
    };
  }

  public async run(
    options: CommandRunOptions,
    data: Record<string, any> = {}
  ): Promise<any> {}
}

export type CommandRunOptions<TInteraction = BaseCommandInteraction> = {
  client: BotClient;
  interaction: TInteraction;
  member?: Discord.GuildMember;
  guild?: Discord.Guild;
};

export type CommandCallback = (
  options: CommandRunOptions,
  data: Record<string, any>
) => Promise<any>;
