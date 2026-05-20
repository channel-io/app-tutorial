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
      title: "Google Calendar 설정",
      description:
        "calendar 함수에서 사용할 기본 캘린더, 시간대, 일정 길이를 설정합니다.",
      blocks: [
        {
          type: "section",
          title: "기본값",
          description: "비워두면 기본값으로 동작합니다. OAuth 연동 정보와 별도로 저장됩니다.",
        },
        {
          type: "select",
          key: "defaultCalendarId",
          label: "기본 캘린더",
          helperText:
            "function 호출에 calendarId가 없을 때 사용할 캘린더입니다. 연동된 계정에서 보이는 캘린더를 불러옵니다.",
          storageClass: "config",
          defaultValue: "primary",
          choices: [{ label: "기본 캘린더", value: "primary" }],
          choicesSource: {
            type: "function",
            functionName: "calendar.listCalendarChoices",
            triggerOnLoad: true,
          },
        },
        {
          type: "text",
          key: "defaultTimezone",
          label: "기본 시간대",
          placeholder: "Asia/Seoul",
          storageClass: "config",
          defaultValue: "Asia/Seoul",
        },
        {
          type: "number",
          key: "defaultEventDurationMinutes",
          label: "기본 일정 길이",
          helperText: "calendar.findAvailableSlots에서 durationMinutes가 없을 때 사용합니다.",
          storageClass: "config",
          defaultValue: 30,
          min: 5,
          max: 480,
          step: 5,
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
            message: "기본 일정 길이는 5분에서 480분 사이의 정수여야 합니다.",
          },
        ],
      };
    }

    return { valid: true };
  }
}
