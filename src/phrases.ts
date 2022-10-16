import { BotClient } from "@trixis/lib-ts-bot";

export default {
  default: {
    botStarted: (client: BotClient) => `Бот ${client.user?.tag} запущен`,
    extension: "Расширение",
    commands: "Команды",
  },
} as const;
