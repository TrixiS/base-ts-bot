import { CommandSubclass, ExtensionSubclass } from "@trixis/lib-ts-bot";
import fs from "fs";
import path from "path";

export type ExtensionPayload = {
  extensionClass: ExtensionSubclass;
  commandClasses: CommandSubclass[];
};

export const readExtensionDirPaths = (extensionsPath: string) => {
  return fs
    .readdirSync(extensionsPath)
    .map((p) => path.join(extensionsPath, p))
    .filter((p) => fs.lstatSync(p).isDirectory());
};

export const readCommandFilePaths = (extensionPath: string) => {
  return fs
    .readdirSync(extensionPath)
    .filter((p) => path.parse(p).name.endsWith("command"))
    .map((p) => path.join(extensionPath, p))
    .filter((p) => fs.lstatSync(p).isFile());
};

export const importDefault = async (path: string) => {
  const imported = await import(path);
  return imported.default;
};

export const importExtension = async (
  extensionPath: string
): Promise<ExtensionPayload> => {
  const extensionClass = await importDefault(extensionPath);
  const commandFilePaths = readCommandFilePaths(extensionPath);
  const commandClasses = await Promise.all(
    commandFilePaths.map((commandFilePath) => importDefault(commandFilePath))
  );

  return { extensionClass, commandClasses };
};

export const importAllExtensions = async (
  extensionsPath: string
): Promise<ExtensionPayload[]> => {
  const extensionDirPaths = readExtensionDirPaths(extensionsPath);
  const extensionPayloads = await Promise.all(
    extensionDirPaths.map((extensionPath) => importExtension(extensionPath))
  );

  return extensionPayloads;
};
