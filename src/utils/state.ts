// TODO: generic state manager with adapters for redis, sqlite3

import { eventHandlerCheckFactory } from "@trixis/lib-ts-bot";
import { ClientEvents } from "discord.js";

export class StateContext<
  State extends string = string,
  Data extends Record<string, any> = Record<string, any>
> {
  public state?: State;
  public data: Partial<Data> = {};

  constructor(
    private readonly manager: typeof StateManager,
    public readonly userId: string
  ) {}

  public clear() {
    this.manager.clearState(this.userId);
  }
}

export class StateManager {
  private static readonly contexts = new Map<string, StateContext>();

  public static getContext<
    State extends string,
    Data extends Record<string, any>
  >(userId: string) {
    const ctx = this.contexts.get(userId);

    if (ctx) {
      return ctx as StateContext<State, Data>;
    }

    const newCtx = new StateContext<State, Data>(this, userId);
    this.contexts.set(userId, newCtx);

    return newCtx;
  }

  public static clearState(userId: string) {
    return this.contexts.delete(userId);
  }

  public static setState<
    State extends string,
    Data extends Record<string, any> = Record<string, any>
  >(userId: string, state: State) {
    const ctx = this.getContext<State, Data>(userId);
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
      const stateCtx = StateManager.getContext(userId);
      return stateCtx.state === state;
    });

export const interactionStateCheck = stateCheckFactory<"interactionCreate">(
  (interaction) => interaction.user.id
);
