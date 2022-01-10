import BotClient from "../client/client";

export default {
  default: {
    botStarted: (client: BotClient) => `Бот ${client.user?.tag} запущен`,
  },
};
