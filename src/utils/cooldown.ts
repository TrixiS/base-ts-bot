import { CommandInteraction } from "discord.js";
import { CommandCooldownBucket } from "@prisma/client";
import { BaseCommandCooldownManager } from "@trixis/lib-ts-bot";
import prisma from "./prisma";

export class DBCommandCooldownManager extends BaseCommandCooldownManager<CommandCooldownBucket> {
  protected async getBucket(interaction: CommandInteraction) {
    const bucketOptions = {
      userId: interaction.user.id,
      guildId: interaction.guildId ?? null,
      channelId: interaction.channelId ?? null,
      commandId: interaction.command!.id,
    };

    const bucket = await prisma.commandCooldownBucket.findFirst({
      where: bucketOptions,
    });

    if (bucket) {
      return bucket;
    }

    return await prisma.commandCooldownBucket.create({
      data: {
        ...bucketOptions,
        useCount: 0,
        expiresAt: this.createExpirationDateFromNow(),
      },
    });
  }

  protected async resetBucket(bucket: CommandCooldownBucket) {
    await prisma.commandCooldownBucket.update({
      where: { id: bucket.id },
      data: { useCount: 0, expiresAt: this.createExpirationDateFromNow() },
    });
  }

  protected async incrementUseCount(bucket: CommandCooldownBucket) {
    await prisma.commandCooldownBucket.update({
      where: { id: bucket.id },
      data: { useCount: { increment: 1 } },
    });
  }
}
