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
        "calendar 함수에서 사용할 기본 캘린더, 시간대, 팀 캘린더, 회의실 캘린더를 설정합니다.",
      blocks: [
        {
          type: "section",
          title: "기본값",
          description: "OAuth 연동 정보와 별도로 저장되는 설정입니다.",
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
        {
          type: "section",
          title: "캘린더",
          description:
            "팀 참석 가능 시간을 볼 때 사용할 캘린더를 선택합니다. 회의실은 보이는 회의실 캘린더에서 찾거나 Google Groups로 확장할 수 있습니다.",
        },
        {
          type: "multiselect",
          key: "teamCalendarIds",
          label: "팀 캘린더",
          helperText:
            "calendarIds가 없을 때 free/busy 조회와 빈 시간 찾기에 사용합니다. 연동된 계정에서 보이는 캘린더를 불러옵니다.",
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
          label: "추가 팀 캘린더 ID",
          helperText: "목록에 보이지 않는 캘린더 ID를 쉼표로 구분해 입력합니다.",
          storageClass: "config",
          rows: 3,
        },
        {
          type: "multiselect",
          key: "roomCalendarIds",
          label: "고정 회의실",
          helperText:
            "선택 사항입니다. 회의실처럼 보이는 캘린더를 불러옵니다. 비워두면 회의실 검색 시 보이는 회의실 캘린더를 자동으로 추론합니다.",
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
          label: "회의실 Google Groups",
          helperText:
            "선택 사항입니다. 회의실/resource 캘린더가 포함된 Google Groups를 쉼표로 구분해 입력합니다. 회의실 캘린더 ID를 하나씩 넣지 않아도 됩니다.",
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
            message: "기본 일정 길이는 5분에서 480분 사이의 정수여야 합니다.",
          },
        ],
      };
    }

    return { valid: true };
  }
}
