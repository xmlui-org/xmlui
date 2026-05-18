export type GuardResult =
  | { allow: true }
  | { allow: false; redirect?: string; reason?: string }
  | false
  | null
  | undefined
  | void;

export type NavigationTrigger = "navigate" | "popstate" | "initial" | "external";

export type GuardFn = (
  to: {
    pathname: string;
    routeParams: Record<string, unknown>;
    search: string;
    trigger: NavigationTrigger;
  },
  from: { pathname: string } | null,
) => GuardResult | Promise<GuardResult>;

export async function runGuard(
  guard: GuardFn | undefined,
  to: Parameters<GuardFn>[0],
  from: Parameters<GuardFn>[1],
): Promise<GuardResult> {
  if (!guard) return { allow: true };
  const result = await guard(to, from);
  return result ?? { allow: true };
}

export function guardAllows(result: GuardResult): boolean {
  if (result === false) return false;
  if (result && typeof result === "object" && "allow" in result) {
    return result.allow === true;
  }
  return true;
}

export function guardRedirect(result: GuardResult): string | undefined {
  if (result && typeof result === "object" && "allow" in result && result.allow === false) {
    return result.redirect;
  }
  return undefined;
}
