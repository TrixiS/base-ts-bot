import { CommandInteraction } from "discord.js";
import { CommandCooldownBucket } from "@prisma/client";
import {
  BaseCommandCooldownManager,
  CommandCooldownStrategy,
} from "@trixis/lib-ts-bot";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";

export class DBCommandCooldownManager extends BaseCommandCooldownManager<CommandCooldownBucket> {
  protected async getBucket(interaction: CommandInteraction) {
    let bucketFindOptions: Prisma.CommandCooldownBucketFindFirstArgs["where"];

    switch (this.options.strategy) {
      case CommandCooldownStrategy.channel:
        bucketFindOptions = { channelId: interaction.channelId };
        break;
      case CommandCooldownStrategy.guild:
        bucketFindOptions = { guildId: interaction.guildId };
        break;
      case CommandCooldownStrategy.member:
        bucketFindOptions = {
          guildId: interaction.guildId,
          userId: interaction.user.id,
        };
        break;
      case CommandCooldownStrategy.user:
        bucketFindOptions = { userId: interaction.user.id };
    }

    const bucket = await prisma.commandCooldownBucket.findFirst({
      where: bucketFindOptions,
    });

    if (bucket) {
      return bucket;
    }

    return await prisma.commandCooldownBucket.create({
      data: {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        channelId: interaction.channelId,
        commandId: interaction.command!.id,
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
