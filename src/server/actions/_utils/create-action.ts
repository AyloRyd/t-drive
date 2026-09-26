import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export type Session = Awaited<ReturnType<typeof auth>>;
export type AuthenticatedSession = Session & {
  userId: NonNullable<Session["userId"]>;
};

export type ActionFailure = { success: false; error: string };

export type ActionSuccess<TData extends object = Record<string, never>> = {
  success: true;
  data: TData;
};

export type ActionResult<TData extends object = Record<string, never>> =
  | ActionSuccess<TData>
  | ActionFailure;

type AuthenticatedActionOptions = {
  withAuth: true;
  refreshCookies?: boolean;
};

type PublicAction<TArgs extends unknown[], TData extends object> = (
  ...args: TArgs
) => Promise<ActionResult<TData>>;

type AuthenticatedActionImpl<TArgs extends unknown[], TData extends object> = (
  session: AuthenticatedSession,
  ...args: TArgs
) => Promise<ActionResult<TData>>;

type OptionalAuthActionImpl<TArgs extends unknown[], TData extends object> = (
  session: Session | null,
  ...args: TArgs
) => Promise<ActionResult<TData>>;

export function createAction<TArgs extends unknown[], TData extends object>(
  options: AuthenticatedActionOptions,
  impl: AuthenticatedActionImpl<TArgs, TData>,
): PublicAction<TArgs, TData>;

export function createAction<TArgs extends unknown[], TData extends object>(
  options: { withAuth?: false; refreshCookies?: boolean },
  impl: OptionalAuthActionImpl<TArgs, TData>,
): PublicAction<TArgs, TData>;

export function createAction<TArgs extends unknown[], TData extends object>(
  options:
    | AuthenticatedActionOptions
    | { withAuth?: false; refreshCookies?: boolean },
  impl:
    | AuthenticatedActionImpl<TArgs, TData>
    | OptionalAuthActionImpl<TArgs, TData>,
): PublicAction<TArgs, TData> {
  return async (...args: TArgs) => {
    const result =
      options.withAuth === true
        ? await (async () => {
            const authSession = await auth();
            if (!authSession.userId) {
              return { success: false as const, error: "Unauthorized" };
            }
            return (impl as AuthenticatedActionImpl<TArgs, TData>)(
              authSession as AuthenticatedSession,
              ...args,
            );
          })()
        : await (impl as OptionalAuthActionImpl<TArgs, TData>)(null, ...args);

    if (options.refreshCookies === true && result.success) {
      const c = await cookies();
      c.set("force-refresh", JSON.stringify(Math.random()));
    }
    return result;
  };
}
