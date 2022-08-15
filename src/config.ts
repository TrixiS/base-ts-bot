import * as path from "path";
import * as fs from "fs";
import { z } from "zod";
import { Config } from "zod-model";
import constants from "./utils/constants";

export const configModel = new Config(
  z.object({
    botToken: z.string().default("")
  })
);

const transformConfigFilename = (filename: string) =>
  path.join(constants.paths.rootPath, filename);

export type ConfigType = "development" | "production";

export const configFilepaths: Record<ConfigType, string> = {
  development: transformConfigFilename("config-dev.json"),
  production: transformConfigFilename("config.json")
};

export const getExistingConfigFilepaths = () =>
  Object.values(configFilepaths).filter((filepath) => fs.existsSync(filepath));

const parseExistingConfig = () => {
  const existingConfigFilepath = getExistingConfigFilepaths()[0];

  if (!existingConfigFilepath) {
    throw new Error("Config not found");
  }

  return configModel.parseFile(existingConfigFilepath, { encoding: "utf-8" });
};

export const config = parseExistingConfig();
