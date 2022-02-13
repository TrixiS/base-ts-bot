import { CommandCallback } from "./command";

export default function subcommand(options: SubCommandOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const subCommand: SubCommand = {
      callback: descriptor.value,
      name: options.name ?? propertyKey,
      group: options.group,
    };

    target._subcommands.push(subCommand);
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
