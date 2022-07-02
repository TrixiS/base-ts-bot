import BaseSlashCommand, { CommandRunOptions } from "./command";

export default function checkFactory(check: CommandCheck) {
  return <T extends CommandSubclass>(constructor: T) => {
    const checksArray = (BaseSlashCommand as any)._checks.get(constructor.name);
    checksArray.push(check);
  };
}

export type CommandSubclass = new (...args: any[]) => BaseSlashCommand;
export type CommandCheck = (options: CommandRunOptions) => Promise<boolean>;
