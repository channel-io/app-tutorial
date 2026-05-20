import { Logger } from "@nestjs/common";
import type { Context } from "@channel.io/app-sdk-core";
import { Ctx, Extension, Func, Input, InputSchema, OutputSchema } from "@channel.io/app-sdk-server";
import { z } from "zod";
import { GoogleCalendarApiError } from "../google/calendar-client.js";
import { GooglePeopleApiError } from "../google/people-client.js";
import { GoogleCalendarService } from "../services/google-calendar.service.js";
import { GOOGLE_CALENDAR_SCOPES } from "../utils/google-context.js";

const EmptyInputSchema = z.object({}).passthrough();
const GoogleOAuthConfigOutputSchema = z.object({
  authType: z.literal("oauth"),
  authScope: z.literal("channel"),
  oauthProvider: z.object({
    provider: z.literal("google"),
    authorizationUrl: z.string().url(),
    tokenUrl: z.string().url(),
    refreshTokenUrl: z.string().url(),
    scopes: z.array(z.string()).min(1),
    providerName: z.string(),
    providerDescription: z.string().optional(),
    parameterCase: z.enum(["snake", "camel"]),
    tokenRequestContentType: z.enum(["form", "json"]),
  }),
});

const ValidateCredentialsOutputSchema = z.object({
  valid: z.boolean(),
  expiresAt: z.string().optional(),
  error: z.string().optional(),
});

type GoogleOAuthConfigOutput = z.infer<typeof GoogleOAuthConfigOutputSchema>;
type ValidateCredentialsOutput = z.infer<typeof ValidateCredentialsOutputSchema>;

@Extension({ name: "oauth", systemVersion: "v1" })
export class GoogleOAuthExtension {
  private readonly logger = new Logger(GoogleOAuthExtension.name);

  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Func("metadata.getAuthConfig")
  @InputSchema(EmptyInputSchema)
  @OutputSchema(GoogleOAuthConfigOutputSchema)
  async getAuthConfig(
    @Ctx() _ctx: Context,
    @Input() _params: z.infer<typeof EmptyInputSchema>,
  ): Promise<GoogleOAuthConfigOutput> {
    return {
      authType: "oauth",
      authScope: "channel",
      oauthProvider: {
        provider: "google",
        authorizationUrl:
          "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent",
        tokenUrl: "https://oauth2.googleapis.com/token",
        refreshTokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [...GOOGLE_CALENDAR_SCOPES],
        providerName: "Google Calendar",
        providerDescription:
          "Google Calendar 캘린더, free/busy 조회, 일정 관리, Google Workspace directory 조회",
        parameterCase: "snake",
        tokenRequestContentType: "form",
      },
    };
  }

  @Func("validation.validateCredentials")
  @InputSchema(EmptyInputSchema)
  @OutputSchema(ValidateCredentialsOutputSchema)
  async validateCredentials(
    @Ctx() ctx: Context,
    @Input() _params: z.infer<typeof EmptyInputSchema>,
  ): Promise<ValidateCredentialsOutput> {
    if (ctx.caller.type !== "system") {
      return {
        valid: false,
        error: "validateCredentials must be called by the system caller.",
      };
    }

    try {
      const client = this.calendarService.createValidationClient(ctx);
      await client.listCalendars({ maxResults: 1 });
      const peopleClient = this.calendarService.createPeopleValidationClient(ctx);
      await peopleClient.listDirectoryPeople({ pageSize: 1 });
      return { valid: true };
    } catch (error) {
      const message =
        error instanceof GoogleCalendarApiError ||
        error instanceof GooglePeopleApiError ||
        error instanceof Error
          ? error.message
          : "Google OAuth credential validation failed.";
      this.logger.warn(`validateCredentials failed: ${message}`);
      return { valid: false, error: message };
    }
  }
}
