import BaseSlashCommand, { CommandRunOptions } from "./command";

export default function checkFactory(check: CommandCheck) {
  return <T extends CommandSubclass>(constructor: T) => {
    // @ts-ignore
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        this._checks.push(check);
      }
    };
  };
}

export type CommandCheck = (options: CommandRunOptions) => Promise<boolean>;

type CommandSubclass = new (...args: any[]) => BaseSlashCommand;
