import Discord, {
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOption
} from "discord.js";
import BotClient from "../client";
import BaseExtension from "./extension";
import DefaultMap from "./defaultMap";
import { BaseCommandInteraction } from "discord.js";
import { CommandCheck } from "./checkFactory";
import { CommandHandler } from "./handler";

// TODO: specify extension type in cmd script (optional)
// TODO: command type in scripts (user context, message, default, etc)

export const runCallbackName = "run";

interface CommandBuilder {
  toJSON: () => any; // @discordjs/builders package developers are just fucking morons
  name: string; //      that could not make their useless builders library compatible with discord.js (event it is the main package)
  // so i have to break types and use any
}

export default abstract class BaseSlashCommand<
  TExtension extends BaseExtension = BaseExtension
> {
  private static _checks: DefaultMap<string, CommandCheck[]> = new DefaultMap(
    () => []
  );

  private static _handlers: DefaultMap<string, CommandHandler[]> =
    new DefaultMap(() => []);

  constructor(
    public readonly extension: TExtension,
    public readonly builder: CommandBuilder
  ) {}

  private _getChecks(): CommandCheck[] {
    return BaseSlashCommand._checks.get(this.constructor.name);
  }

  private _getHandlers(): CommandHandler[] {
    return BaseSlashCommand._handlers.get(this.constructor.name);
  }

  public get checks(): ReadonlyArray<CommandCheck> {
    return this._getChecks();
  }

  public get handlers(): ReadonlyArray<CommandHandler> {
    return this._getHandlers();
  }

  public addCheck(check: CommandCheck) {
    this._getChecks().push(check);
  }

  public addHandler(handler: CommandHandler) {
    this._getHandlers().push(handler);
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

    let options: Record<string, any> = {};

    if (interaction instanceof CommandInteraction) {
      options = this.getCommandArgumentOptions(interaction);
    }

    return {
      interaction,
      member,
      guild,
      options,
      client: this.extension.client
    };
  }

  getCommandArgumentOptions(interaction: CommandInteraction) {
    const options: Record<string, any> = {};

    if (!interaction.command) {
      return options;
    }

    for (const option of interaction.command?.options) {
      const argumentOption = interaction.options.get(option.name)!;
      options[option.name] = this.convertCommandOptionValue(
        interaction.options,
        argumentOption
      );
    }

    return options;
  }

  convertCommandOptionValue(
    resolver: CommandInteraction["options"],
    option: CommandInteractionOption
  ) {
    type OptionConverter = (name: string, required?: boolean) => any;
    const excludedOptionConverter: OptionConverter = (..._) => undefined;

    const converters: Record<ApplicationCommandOptionType, OptionConverter> = {
      ATTACHMENT: resolver.getAttachment,
      BOOLEAN: resolver.getBoolean,
      CHANNEL: resolver.getChannel,
      INTEGER: resolver.getInteger,
      MENTIONABLE: resolver.getMentionable,
      NUMBER: resolver.getNumber,
      ROLE: resolver.getRole,
      STRING: resolver.getString,
      USER: resolver.getUser,
      SUB_COMMAND: excludedOptionConverter,
      SUB_COMMAND_GROUP: excludedOptionConverter
    };

    const converter = converters[option.type];
    return converter.call(resolver, option.name);
  }
}

export type CommandRunOptions<
  TInteraction = BaseCommandInteraction,
  TArgumentOptions = Record<string, any>
> = {
  client: BotClient;
  interaction: TInteraction;
  options: TArgumentOptions;
  member?: Discord.GuildMember;
  guild?: Discord.Guild;
};

export type CommandCallback = (
  options: CommandRunOptions,
  data: Record<string, any>
) => Promise<any>;
