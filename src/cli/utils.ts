import path from "path";
import constants from "../utils/constants";
import { exec } from "child_process";

export const extensionsPath = path.join(constants.rootPath, "./src/extensions");

export function jumpToFile(filepath: string) {
  exec(`code ${filepath}`);
}

// Stole this function from https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function getExtensionDirPath(name: string) {
  const extensionDirPath = path.join(extensionsPath, toCamelCase(name));
  return extensionDirPath;
}
