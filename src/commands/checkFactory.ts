import BaseSlashCommand, { CommandRunOptions } from "./command";

export default function checkFactory(check: CommandCheck) {
  return <T extends CommandSubclass>(constructor: T) => {
    constructor.prototype._checks.push(check);
  };
}

type CommandSubclass = new (...args: any[]) => BaseSlashCommand;

export type CommandCheck = (options: CommandRunOptions) => Promise<boolean>;
