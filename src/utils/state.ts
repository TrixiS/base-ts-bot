import { eventHandlerCheckFactory } from "@trixis/lib-ts-bot";
import { ClientEvents } from "discord.js";

export type StateCtx<
  TState extends string = string,
  TData extends Record<string, any> = Record<string, any>
> = {
  state?: TState;
  data?: Partial<TData>;
};

// TODO: pass adapter: Memory, Prisma, Redis
// TODO: add strategy: User, Guild, Channel
export class StateManager {
  private static readonly contexts = new Map<string, StateCtx>();

  static getCtx<T extends StateCtx>(userId: string): T {
    let ctx = this.contexts.get(userId) as T | undefined;

    if (ctx) {
      return ctx;
    }

    ctx = {} as T;
    this.contexts.set(userId, ctx);
    return ctx;
  }

  static setState<T extends StateCtx>(
    userId: string,
    state: T extends StateCtx<infer TState> ? TState : never
  ) {
    const ctx = this.getCtx<T>(userId);
    ctx.state = state;
    return ctx;
  }
}

export const stateCheckFactory =
  <Event extends keyof ClientEvents>(
    getUserIdCallback: (...args: ClientEvents[Event]) => string
  ) =>
  <State extends string>(state: State) =>
    eventHandlerCheckFactory<Event>(async (...args: ClientEvents[Event]) => {
      const userId = getUserIdCallback(...args);
      const ctx = StateManager.getCtx(userId);
      return ctx.state === state;
    });

export const interactionStateCheck = stateCheckFactory<"interactionCreate">(
  (interaction) => interaction.user.id
);
