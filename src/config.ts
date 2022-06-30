import fs from "fs";
import path from "path";
import constants from "./utils/constants";

export type Config = {
  readonly botToken: string;
};

class ConfigParser {
  private static _configFileNames: string[] = [
    "config_dev.json",
    "config.json"
  ];

  public static loadFromFile(filepath: string): Config {
    const content = fs.readFileSync(filepath, { encoding: "utf-8" });
    const configObject = JSON.parse(content);
    return configObject;
  }

  public static loadFirst(rootPath: string): Config {
    for (const configFileName of this._configFileNames) {
      const configPath = path.join(rootPath, configFileName);

      if (!checkFileExists(configPath)) {
        continue;
      }

      return this.loadFromFile(configPath);
    }

    throw new Error("Config not found");
  }
}

async function checkFileExists(filepath: string): Promise<boolean> {
  try {
    fs.statSync(filepath);
    return true;
  } catch {
    return false;
  }
}

export default ConfigParser.loadFirst(constants.rootPath) as Readonly<Config>;
