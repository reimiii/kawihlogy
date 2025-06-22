import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { EntityManager } from 'typeorm';

export type PickExcept<T, K extends keyof T> = Omit<T, K>;
/*───────────────────────────────────────────────────────────────
  1. Tiny reusable mix-ins
  ───────────────────────────────────────────────────────────────*/
export interface WithUser<U = UserClaims> {
  by: U;
}

export interface WithIdentifier<I = unknown> {
  identifier: I;
}

export interface WithPayload<P = unknown> {
  data: P;
}

export type WithMgr<T> = T & { mgr: EntityManager };

/*───────────────────────────────────────────────────────────────
  2. Generic option “recipes”
  ───────────────────────────────────────────────────────────────*/
export type CreateOpts<P, U = UserClaims> = WithPayload<P> & WithUser<U>;

export type UpdateOpts<I, P, U = UserClaims> = WithIdentifier<I> &
  WithPayload<P> &
  WithUser<U>;

export type DeleteOpts<I, U = UserClaims> = WithIdentifier<I> & WithUser<U>;

export type ReadOpts<I, U = UserClaims> = WithIdentifier<I> & WithUser<U>;

export type ActionOpts<I, U = UserClaims> = WithIdentifier<I> & WithUser<U>;

/*  …and the “command” flavours (needs EntityManager) */
export type CreateCmdOpts<P, U = UserClaims> = WithMgr<CreateOpts<P, U>>;
export type UpdateCmdOpts<I, P, U = UserClaims> = WithMgr<UpdateOpts<I, P, U>>;
export type DeleteCmdOpts<I, U = UserClaims> = WithMgr<DeleteOpts<I, U>>;
export type ActionCmdOpts<I, U = UserClaims> = WithMgr<ActionOpts<I, U>>;
