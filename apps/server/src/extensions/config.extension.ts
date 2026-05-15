import type {
  ConfigExtensionInterface,
  Context,
  GetConfigSchemaOutput,
  ValidateStoredConfigOutput,
} from "@channel.io/app-sdk-core";
import {
  ConfigFunctionNames,
  GetConfigSchemaOutputSchema,
  ValidateStoredConfigOutputSchema,
} from "@channel.io/app-sdk-core";
import { Ctx, Extension, Func, OutputSchema } from "@channel.io/app-sdk-server";
import { getConfigNumber } from "../utils/google-context.js";

@Extension({ name: "config", systemVersion: "v1" })
export class GoogleCalendarConfigExtension implements ConfigExtensionInterface {
  @Func(ConfigFunctionNames.getConfigSchema)
  @OutputSchema(GetConfigSchemaOutputSchema)
  async getConfigSchema(@Ctx() _ctx: Context): Promise<GetConfigSchemaOutput> {
    return {
      schemaVersion: "v1",
      configScope: "channel",
      providerName: "Calendar",
      title: "Calendar settings",
      description:
        "Set the default calendar, timezone, team calendars, and meeting room calendars used by calendar functions.",
      blocks: [
        {
          type: "section",
          title: "Defaults",
          description: "These values are independent from OAuth credentials.",
        },
        {
          type: "select",
          key: "defaultCalendarId",
          label: "Default calendar",
          helperText:
            "Calendar used when a function call does not pass calendarId. Choices load from calendars visible to the connected account.",
          storageClass: "config",
          defaultValue: "primary",
          choices: [{ label: "Primary calendar", value: "primary" }],
          choicesSource: {
            type: "function",
            functionName: "calendar.listCalendarChoices",
            triggerOnLoad: true,
          },
        },
        {
          type: "text",
          key: "defaultTimezone",
          label: "Default timezone",
          placeholder: "Asia/Seoul",
          storageClass: "config",
          defaultValue: "Asia/Seoul",
        },
        {
          type: "number",
          key: "defaultEventDurationMinutes",
          label: "Default event duration",
          helperText: "Used by calendar.findAvailableSlots when durationMinutes is omitted.",
          storageClass: "config",
          defaultValue: 30,
          min: 5,
          max: 480,
          step: 5,
        },
        {
          type: "section",
          title: "Calendars",
          description:
            "Choose visible calendars for team availability. Meeting rooms can be discovered from visible room calendars or expanded from Google Groups.",
        },
        {
          type: "multiselect",
          key: "teamCalendarIds",
          label: "Team calendars",
          helperText:
            "Used by free/busy and slot search when calendarIds are omitted. Choices load from calendars visible to the connected account.",
          storageClass: "config",
          choicesSource: {
            type: "function",
            functionName: "calendar.listCalendarChoices",
            triggerOnLoad: true,
          },
        },
        {
          type: "textarea",
          key: "additionalTeamCalendarIds",
          label: "Additional team calendar IDs",
          helperText: "Comma-separated calendar IDs that are not available in the visible list.",
          storageClass: "config",
          rows: 3,
        },
        {
          type: "multiselect",
          key: "roomCalendarIds",
          label: "Pinned meeting rooms",
          helperText:
            "Optional. Choices load from visible calendars that look like rooms. If omitted, room search can infer visible room calendars automatically.",
          storageClass: "config",
          choicesSource: {
            type: "function",
            functionName: "calendar.listRoomCalendarChoices",
            triggerOnLoad: true,
          },
        },
        {
          type: "textarea",
          key: "roomCalendarGroupIds",
          label: "Meeting room groups",
          helperText:
            "Optional comma-separated Google Groups that contain room/resource calendars. This avoids entering every room calendar ID one by one.",
          storageClass: "config",
          rows: 3,
        },
      ],
    };
  }

  @Func(ConfigFunctionNames.validateStoredConfig)
  @OutputSchema(ValidateStoredConfigOutputSchema)
  async validateStoredConfig(@Ctx() ctx: Context): Promise<ValidateStoredConfigOutput> {
    const durationMinutes = getConfigNumber(ctx, "defaultEventDurationMinutes");
    if (
      durationMinutes !== undefined &&
      (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480)
    ) {
      return {
        valid: false,
        errors: [
          {
            fieldKey: "defaultEventDurationMinutes",
            reasonCode: "invalid_duration",
            message: "Default event duration must be an integer between 5 and 480 minutes.",
          },
        ],
      };
    }

    return { valid: true };
  }
}
