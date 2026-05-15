import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Context } from "@channel.io/app-sdk-core";
import { GoogleCalendarClient } from "../google/calendar-client.js";
import { GooglePeopleClient } from "../google/people-client.js";
import {
  getConfigNumber,
  getConfigString,
  getConfigStringList,
  parseCommaSeparatedList,
  requireGoogleAuthToken,
} from "../utils/google-context.js";

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly config: ConfigService) {}

  createClient(ctx: Context): GoogleCalendarClient {
    const token = requireGoogleAuthToken(ctx);
    return new GoogleCalendarClient(token);
  }

  createValidationClient(ctx: Context): GoogleCalendarClient {
    if (!ctx.authToken) {
      throw new Error("Google OAuth token is missing from validation context.");
    }
    return new GoogleCalendarClient(ctx.authToken);
  }

  createPeopleClient(ctx: Context): GooglePeopleClient {
    const token = requireGoogleAuthToken(ctx);
    return new GooglePeopleClient(token);
  }

  createPeopleValidationClient(ctx: Context): GooglePeopleClient {
    if (!ctx.authToken) {
      throw new Error("Google OAuth token is missing from validation context.");
    }
    return new GooglePeopleClient(ctx.authToken);
  }

  getDefaultTimezone(ctx: Context, provided?: string): string {
    return (
      provided ??
      getConfigString(ctx, "defaultTimezone") ??
      this.config.get<string>("GOOGLE_DEFAULT_TIMEZONE") ??
      "Asia/Seoul"
    );
  }

  getDefaultCalendarId(ctx: Context, provided?: string): string {
    return (
      provided ??
      getConfigString(ctx, "defaultCalendarId") ??
      this.config.get<string>("GOOGLE_DEFAULT_CALENDAR_ID") ??
      "primary"
    );
  }

  getDefaultEventDurationMinutes(ctx: Context): number {
    const configDuration = getConfigNumber(ctx, "defaultEventDurationMinutes");
    if (configDuration && Number.isFinite(configDuration)) {
      return configDuration;
    }

    const value = this.config.get<string>("GOOGLE_DEFAULT_EVENT_DURATION_MINUTES");
    const parsed = value ? Number(value) : undefined;
    return parsed && Number.isFinite(parsed) ? parsed : 30;
  }

  getTeamCalendarIds(ctx: Context, provided?: string[]): string[] {
    if (provided && provided.length > 0) {
      return provided;
    }

    const configCalendarIds = uniqueCalendarIds([
      ...getConfigStringList(ctx, "teamCalendarIds"),
      ...getConfigStringList(ctx, "additionalTeamCalendarIds"),
    ]);
    if (configCalendarIds.length > 0) {
      return configCalendarIds;
    }

    const envCalendarIds = parseCommaSeparatedList(
      this.config.get<string>("GOOGLE_TEAM_CALENDAR_IDS"),
    );
    if (envCalendarIds.length > 0) {
      return envCalendarIds;
    }

    return [this.getDefaultCalendarId(ctx)];
  }

  getRoomCalendarIds(ctx: Context, provided?: string[]): string[] {
    if (provided && provided.length > 0) {
      return provided;
    }

    const configRoomCalendarIds = uniqueCalendarIds(getConfigStringList(ctx, "roomCalendarIds"));
    if (configRoomCalendarIds.length > 0) {
      return configRoomCalendarIds;
    }

    return parseCommaSeparatedList(this.config.get<string>("GOOGLE_ROOM_CALENDAR_IDS"));
  }

  getRoomCalendarGroupIds(ctx: Context, provided?: string[]): string[] {
    if (provided && provided.length > 0) {
      return provided;
    }

    return uniqueCalendarIds([
      ...getConfigStringList(ctx, "roomCalendarGroupIds"),
      ...parseCommaSeparatedList(this.config.get<string>("GOOGLE_ROOM_GROUP_IDS")),
    ]);
  }
}

function uniqueCalendarIds(calendarIds: string[]): string[] {
  return [...new Set(calendarIds)];
}
