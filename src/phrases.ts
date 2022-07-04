import BotClient from "./client";

export default {
  default: {
    botStarted: (client: BotClient) => `Бот ${client.user?.tag} запущен`,
    extensionLoaded: (extensionName: string) =>
      `Загружено расширение - ${extensionName}`
  }
};
