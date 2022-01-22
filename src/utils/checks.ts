import Discord from "discord.js";
import checkFactory from "../commands/checkFactory";
import { CommandRunOptions } from "../commands/command";

export const guildOnly = () => {
  return checkFactory(async ({ interaction }: CommandRunOptions) => {
    return Boolean(interaction.guild && interaction.member);
  });
};

export const hasPermissions = (
  ...permissions: Discord.PermissionResolvable[]
) => {
  return checkFactory(async ({ interaction }: CommandRunOptions) => {
    if (!interaction.guild) {
      return false;
    }

    const resolvedMember = interaction.guild.members.resolve(
      interaction.user.id
    );

    if (!resolvedMember) {
      return false;
    }

    return permissions
      .map((permission) => resolvedMember.permissions.has(permission))
      .every((result) => result);
  });
};
