import fs from "fs/promises";
import path from "path";

// TODO: use config npm package

export type ConfigType = {
  readonly botToken: string;
};

export default class Config {
  private static _configFileNames: string[] = [
    "config_dev.json",
    "config.json",
  ];

  public static async loadFromFile(filepath: string): Promise<ConfigType> {
    const content = await fs.readFile(filepath, { encoding: "utf-8" });
    const configObject = JSON.parse(content);
    return configObject;
  }

  public static async loadFirst(rootPath: string): Promise<ConfigType | null> {
    for (const configFileName of this._configFileNames) {
      const configPath = path.join(rootPath, configFileName);

      if (!(await checkFileExists(configPath))) {
        continue;
      }

      return this.loadFromFile(configPath);
    }

    return null;
  }
}

async function checkFileExists(filepath: string): Promise<boolean> {
  try {
    await fs.stat(filepath);
    return true;
  } catch {
    return false;
  }
}
