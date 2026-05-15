import type { Context } from "@channel.io/app-sdk-core";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/directory.readonly",
] as const;

export function requireGoogleAuthToken(ctx: Context): string {
  if (!ctx.authToken) {
    throw new Error("Google OAuth token is missing from function context.");
  }

  return ctx.authToken;
}

export function parseCommaSeparatedList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getConfigString(ctx: Context, key: string): string | undefined {
  const value = ctx.config?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function getConfigNumber(ctx: Context, key: string): number | undefined {
  const value = ctx.config?.[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function getConfigStringList(ctx: Context, key: string): string[] {
  const value = ctx.config?.[key];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return typeof value === "string" ? parseCommaSeparatedList(value) : [];
}
