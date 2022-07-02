import BaseSlashCommand, { CommandCallback } from "./command";

export default function commandHandler<T extends BaseSlashCommand>(
  options: CommandHandlerOptions = {}
) {
  return (target: T, propertyKey: string, descriptor: PropertyDescriptor) => {
    const handler: CommandHandler = {
      callback: descriptor.value,
      name: options.name ?? propertyKey,
      group: options.group
    };

    const handlers = (BaseSlashCommand as any)._handlers.get(
      target.constructor.name
    );

    handlers.push(handler);
  };
}

export type CommandHandlerOptions = {
  name?: string;
  group?: string;
};

// TODO: add check here
// TODO: add parsed options converters as decorators as well e. g.
//       factory for converter decorator -> @converter("optionName")
export type CommandHandler = {
  callback: CommandCallback;
  name: string;
  group?: string;
};
