import BaseSlashCommand, { CommandCallback } from "./command";

export default function subcommand(options: SubCommandOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const subCommand: SubCommand = {
      callback: descriptor.value,
      name: options.name ?? propertyKey,
      group: options.group,
    };

    const subcommands = (BaseSlashCommand as any)._subcommands.get(
      target.constructor.name
    );

    subcommands.push(subCommand);
  };
}

export type SubCommand = {
  readonly callback: CommandCallback;
  readonly name: string;
  readonly group?: string;
};

export type SubCommandOptions = {
  name?: string;
  group?: string;
};
