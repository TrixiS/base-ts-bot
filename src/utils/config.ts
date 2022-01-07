import fs from "fs";
import path from "path";

export type Config = {
  botToken: string;
};

const configFileNames = ["config_dev.json", "config.json"];
const rootPath = path.join(__dirname, "../..");

export const loadConfig = (): Config => {
  for (const fileName of configFileNames) {
    const configPath = path.join(rootPath, fileName);

    if (!fs.existsSync(configPath)) {
      continue;
    }

    const configContent = fs.readFileSync(configPath, { encoding: "utf-8" });
    const configObject = JSON.parse(configContent);

    return configObject;
  }

  return {} as Config;
};
