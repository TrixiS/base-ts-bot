import BaseSlashCommand from "./command";
import BaseExtension from "./extension";

export type SubclassTypeGenerator<T> = new (...args: any[]) => T;
export type CommandSubclass = SubclassTypeGenerator<BaseSlashCommand>;
export type ExtensionSubclass = SubclassTypeGenerator<BaseExtension>;
