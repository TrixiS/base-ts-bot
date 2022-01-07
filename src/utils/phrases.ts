import { Client } from "discord.js";

export default {
  botStarted: (bot: Client) => `Бот ${bot.user?.tag} запущен`,
};
