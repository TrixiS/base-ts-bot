import { CommandCallback } from "./command";

export default function subcommand(options: SubCommandOptions = {}) {
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

export type SubCommandOptions = {
  name?: string;
  group?: string;
};
