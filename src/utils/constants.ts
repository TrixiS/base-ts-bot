import * as path from "path";

const rootPath = path.join(__dirname, "../..");

export default {
  colors: {
    darkTheme: 0x36393f,
  },
  paths: {
    extensionsPath: path.join(__dirname, "../extensions"),
    rootPath,
  },
};
