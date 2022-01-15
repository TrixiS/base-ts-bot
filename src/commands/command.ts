import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import BotClient from "../client/client";

export default abstract class BaseSlashCommand {
  private _subcommands: SubCommand[];

  constructor(
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

  public abstract run(options: CommandRunOptions): any;
}

export function subcommand(options: SubCommandOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (!descriptor.value) {
      throw new Error(`Descriptor value is ${descriptor.value}`);
    }

    if (!delete target[propertyKey]) {
      throw new Error(
        "Cannot delete a method to register a subcommand handler"
      );
    }

    descriptor.value = new SubCommand(
      descriptor.value,
      options.name ?? propertyKey,
      options.group
    );
  };
}

export class SubCommand {
  constructor(
    public readonly callback: CommandCallback,
    public readonly name: string,
    public readonly group?: string
  ) {}
}

export type CommandRunOptions = {
  client: BotClient;
  interaction: CommandInteraction;
};

type CommandCallback = (options: CommandRunOptions) => Promise<any>;

type SubCommandOptions = {
  name?: string;
  group?: string;
};
