import { Injectable } from "@nestjs/common";
import type { Context } from "@channel.io/app-sdk-core";
import { Ctx, Func, Input, InputSchema, OutputSchema } from "@channel.io/app-sdk-server";
import { z } from "zod";
import { buildAvailableSlots, type BusyInterval } from "../google/availability.js";
import type { GoogleDirectoryPerson } from "../google/people-client.js";
import type { GoogleCalendarListEntry, GoogleEvent } from "../google/types.js";
import { GoogleCalendarService } from "../services/google-calendar.service.js";

const TimeRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const CalendarSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string().optional(),
  isPrimary: z.boolean().optional(),
  accessRole: z.string().optional(),
});

const ConfigChoiceSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

const BusyIntervalSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const CalendarFreeBusySchema = z.object({
  calendarId: z.string(),
  busy: z.array(BusyIntervalSchema),
  errors: z
    .array(z.object({ domain: z.string().optional(), reason: z.string().optional() }))
    .optional(),
});

const EventDateTimeSchema = z.object({
  date: z.string().optional(),
  dateTime: z.string().optional(),
  timeZone: z.string().optional(),
});

const EventAttendeeInputSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  optional: z.boolean().optional(),
});

const EventAttendeeOutputSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  optional: z.boolean().optional(),
  resource: z.boolean().optional(),
  responseStatus: z.string().optional(),
});

const CalendarEventSchema = z.object({
  id: z.string(),
  calendarId: z.string(),
  htmlLink: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  start: EventDateTimeSchema.optional(),
  end: EventDateTimeSchema.optional(),
  attendees: z.array(EventAttendeeOutputSchema).optional(),
  meetingUrl: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

const DirectoryMemberSchema = z.object({
  resourceName: z.string().optional(),
  displayName: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  email: z.string().optional(),
  calendarId: z.string().optional(),
  photoUrl: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  deleted: z.boolean().optional(),
});

const SendUpdatesSchema = z.enum(["all", "externalOnly", "none"]);

const ListMembersInputSchema = z.object({
  maxResults: z.number().int().min(1).max(1000).optional(),
  pageToken: z.string().optional(),
  includeDomainContacts: z.boolean().optional(),
});
const ListMembersOutputSchema = z.object({
  members: z.array(DirectoryMemberSchema),
  nextPageToken: z.string().optional(),
});

const SearchMembersInputSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().int().min(1).max(500).optional(),
  pageToken: z.string().optional(),
  includeDomainContacts: z.boolean().optional(),
});
const SearchMembersOutputSchema = z.object({
  members: z.array(DirectoryMemberSchema),
  nextPageToken: z.string().optional(),
  totalSize: z.number().optional(),
});

const ListCalendarsInputSchema = z.object({
  pageToken: z.string().optional(),
  maxResults: z.number().int().min(1).max(250).optional(),
  minAccessRole: z.enum(["freeBusyReader", "reader", "writer", "owner"]).optional(),
  showDeleted: z.boolean().optional(),
  showHidden: z.boolean().optional(),
});
const ListCalendarsOutputSchema = z.object({
  calendars: z.array(CalendarSummarySchema),
  nextPageToken: z.string().optional(),
});

const CalendarChoicesInputSchema = z.object({
  includeHidden: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
});
const CalendarChoicesOutputSchema = z.object({
  choices: z.array(ConfigChoiceSchema),
});

const ListEventsInputSchema = z.object({
  calendarId: z.string().optional(),
  timeRange: TimeRangeSchema.optional(),
  maxResults: z.number().int().min(1).max(250).optional(),
  pageToken: z.string().optional(),
  query: z.string().optional(),
  singleEvents: z.boolean().optional(),
  orderBy: z.enum(["startTime", "updated"]).optional(),
});
const ListEventsOutputSchema = z.object({
  events: z.array(CalendarEventSchema),
  nextPageToken: z.string().optional(),
});

const GetFreeBusyInputSchema = z.object({
  calendarIds: z.array(z.string()).min(1).optional(),
  timeRange: TimeRangeSchema,
  timezone: z.string().optional(),
});
const GetFreeBusyOutputSchema = z.object({
  calendars: z.array(CalendarFreeBusySchema),
  timeRange: TimeRangeSchema,
  timezone: z.string(),
});

const FindAvailableSlotsInputSchema = z.object({
  calendarIds: z.array(z.string()).min(1).optional(),
  timeRange: TimeRangeSchema,
  durationMinutes: z.number().int().min(5).max(480).optional(),
  bufferMinutes: z.number().int().min(0).max(240).optional(),
  timezone: z.string().optional(),
});
const FindAvailableSlotsOutputSchema = z.object({
  slots: z.array(TimeRangeSchema),
  calendarIds: z.array(z.string()),
  timezone: z.string(),
});

const FindAvailableRoomsInputSchema = z.object({
  roomCalendarIds: z.array(z.string()).min(1).optional(),
  roomGroupIds: z.array(z.string()).min(1).optional(),
  attendeeCalendarIds: z.array(z.string()).min(1).optional(),
  timeRange: TimeRangeSchema,
  timezone: z.string().optional(),
  includeUnavailable: z.boolean().optional(),
});
const RoomAvailabilitySchema = z.object({
  calendarId: z.string(),
  name: z.string().optional(),
  timezone: z.string().optional(),
  roomAvailable: z.boolean(),
  available: z.boolean(),
  busy: z.array(BusyIntervalSchema),
});
const FindAvailableRoomsOutputSchema = z.object({
  attendeesAvailable: z.boolean(),
  rooms: z.array(RoomAvailabilitySchema),
  availableRooms: z.array(RoomAvailabilitySchema),
  timezone: z.string(),
});

const CreateEventInputSchema = z.object({
  calendarId: z.string().optional(),
  summary: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string().optional(),
  attendees: z.array(EventAttendeeInputSchema).optional(),
  roomCalendarIds: z.array(z.string()).optional(),
  sendUpdates: SendUpdatesSchema.optional(),
  createMeetLink: z.boolean().optional(),
});
const CreateEventOutputSchema = z.object({
  event: CalendarEventSchema,
});

const UpdateEventInputSchema = z.object({
  calendarId: z.string().optional(),
  eventId: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
  attendees: z.array(EventAttendeeInputSchema).optional(),
  roomCalendarIds: z.array(z.string()).optional(),
  sendUpdates: SendUpdatesSchema.optional(),
  createMeetLink: z.boolean().optional(),
});
const UpdateEventOutputSchema = z.object({
  event: CalendarEventSchema,
});

type ListCalendarsInput = z.infer<typeof ListCalendarsInputSchema>;
type ListMembersInput = z.infer<typeof ListMembersInputSchema>;
type SearchMembersInput = z.infer<typeof SearchMembersInputSchema>;
type CalendarChoicesInput = z.infer<typeof CalendarChoicesInputSchema>;
type ListEventsInput = z.infer<typeof ListEventsInputSchema>;
type GetFreeBusyInput = z.infer<typeof GetFreeBusyInputSchema>;
type FindAvailableSlotsInput = z.infer<typeof FindAvailableSlotsInputSchema>;
type FindAvailableRoomsInput = z.infer<typeof FindAvailableRoomsInputSchema>;
type CreateEventInput = z.infer<typeof CreateEventInputSchema>;
type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;
type ConfigChoice = z.infer<typeof ConfigChoiceSchema>;
type RoomAvailability = z.infer<typeof RoomAvailabilitySchema>;

@Injectable()
export class CalendarFunctions {
  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Func({
    name: "calendar.listMembers",
    description: "List members from the connected Google Workspace directory.",
  })
  @InputSchema(ListMembersInputSchema)
  @OutputSchema(ListMembersOutputSchema)
  async listMembers(@Ctx() ctx: Context, @Input() params: ListMembersInput) {
    const response = await this.calendarService.createPeopleClient(ctx).listDirectoryPeople({
      pageSize: params.maxResults,
      pageToken: params.pageToken,
      includeDomainContacts: params.includeDomainContacts,
    });

    return {
      members: (response.people ?? []).map(mapDirectoryMember),
      nextPageToken: response.nextPageToken,
    };
  }

  @Func({
    name: "calendar.searchMembers",
    description: "Search members in the connected Google Workspace directory by name or email.",
  })
  @InputSchema(SearchMembersInputSchema)
  @OutputSchema(SearchMembersOutputSchema)
  async searchMembers(@Ctx() ctx: Context, @Input() params: SearchMembersInput) {
    const response = await this.calendarService.createPeopleClient(ctx).searchDirectoryPeople({
      query: params.query,
      pageSize: params.maxResults,
      pageToken: params.pageToken,
      includeDomainContacts: params.includeDomainContacts,
    });

    return {
      members: (response.people ?? []).map(mapDirectoryMember),
      nextPageToken: response.nextPageToken,
      totalSize: response.totalSize,
    };
  }

  @Func({
    name: "calendar.listCalendars",
    description: "List calendars visible to the connected account.",
  })
  @InputSchema(ListCalendarsInputSchema)
  @OutputSchema(ListCalendarsOutputSchema)
  async listCalendars(@Ctx() ctx: Context, @Input() params: ListCalendarsInput) {
    const client = this.calendarService.createClient(ctx);
    const response = await client.listCalendars(params);
    return {
      calendars: (response.items ?? []).map((calendar) => mapCalendarSummary(calendar)),
      nextPageToken: response.nextPageToken,
    };
  }

  @Func({
    name: "calendar.listCalendarChoices",
    description: "List visible calendars as config choices.",
  })
  @InputSchema(CalendarChoicesInputSchema)
  @OutputSchema(CalendarChoicesOutputSchema)
  async listCalendarChoices(@Ctx() ctx: Context, @Input() params: CalendarChoicesInput) {
    const calendars = await this.listChoiceCalendars(ctx, params);
    return { choices: withPrimaryAlias(calendars.map(mapCalendarChoice)) };
  }

  @Func({
    name: "calendar.listRoomCalendarChoices",
    description: "List visible meeting room-like calendars as config choices.",
  })
  @InputSchema(CalendarChoicesInputSchema)
  @OutputSchema(CalendarChoicesOutputSchema)
  async listRoomCalendarChoices(@Ctx() ctx: Context, @Input() params: CalendarChoicesInput) {
    const calendars = await this.listChoiceCalendars(ctx, params);
    return { choices: calendars.filter(isLikelyRoomCalendar).map(mapCalendarChoice) };
  }

  @Func({
    name: "calendar.listEvents",
    description: "List events from a calendar.",
  })
  @InputSchema(ListEventsInputSchema)
  @OutputSchema(ListEventsOutputSchema)
  async listEvents(@Ctx() ctx: Context, @Input() params: ListEventsInput) {
    const client = this.calendarService.createClient(ctx);
    const calendarId = this.calendarService.getDefaultCalendarId(ctx, params.calendarId);
    const response = await client.listEvents(calendarId, {
      timeMin: params.timeRange?.start,
      timeMax: params.timeRange?.end,
      maxResults: params.maxResults,
      pageToken: params.pageToken,
      q: params.query,
      singleEvents: params.singleEvents,
      orderBy: params.orderBy,
    });

    return {
      events: (response.items ?? []).map((event) => mapGoogleEvent(calendarId, event)),
      nextPageToken: response.nextPageToken,
    };
  }

  @Func({
    name: "calendar.getFreeBusy",
    description: "Get busy intervals for one or more calendars.",
  })
  @InputSchema(GetFreeBusyInputSchema)
  @OutputSchema(GetFreeBusyOutputSchema)
  async getFreeBusy(@Ctx() ctx: Context, @Input() params: GetFreeBusyInput) {
    const calendarIds = this.calendarService.getTeamCalendarIds(ctx, params.calendarIds);
    const timezone = this.calendarService.getDefaultTimezone(ctx, params.timezone);
    const response = await this.calendarService.createClient(ctx).getFreeBusy({
      timeMin: params.timeRange.start,
      timeMax: params.timeRange.end,
      timeZone: timezone,
      calendarIds,
    });

    return {
      calendars: mapFreeBusyCalendars(calendarIds, response.calendars),
      timeRange: params.timeRange,
      timezone,
    };
  }

  @Func({
    name: "calendar.findAvailableSlots",
    description: "Find free time slots across calendars.",
  })
  @InputSchema(FindAvailableSlotsInputSchema)
  @OutputSchema(FindAvailableSlotsOutputSchema)
  async findAvailableSlots(@Ctx() ctx: Context, @Input() params: FindAvailableSlotsInput) {
    const calendarIds = this.calendarService.getTeamCalendarIds(ctx, params.calendarIds);
    const timezone = this.calendarService.getDefaultTimezone(ctx, params.timezone);
    const response = await this.calendarService.createClient(ctx).getFreeBusy({
      timeMin: params.timeRange.start,
      timeMax: params.timeRange.end,
      timeZone: timezone,
      calendarIds,
    });
    const busyIntervals = calendarIds.flatMap((calendarId) =>
      expandBusyIntervals(response.calendars?.[calendarId]?.busy ?? [], params.bufferMinutes ?? 0),
    );

    return {
      slots: buildAvailableSlots(busyIntervals, {
        timeMin: params.timeRange.start,
        timeMax: params.timeRange.end,
        slotMinutes:
          params.durationMinutes ?? this.calendarService.getDefaultEventDurationMinutes(ctx),
      }).map((slot) => ({
        start: slot.startTime,
        end: slot.endTime,
      })),
      calendarIds,
      timezone,
    };
  }

  @Func({
    name: "calendar.findAvailableRooms",
    description: "Find available meeting rooms for a time range.",
  })
  @InputSchema(FindAvailableRoomsInputSchema)
  @OutputSchema(FindAvailableRoomsOutputSchema)
  async findAvailableRooms(@Ctx() ctx: Context, @Input() params: FindAvailableRoomsInput) {
    const client = this.calendarService.createClient(ctx);
    const timezone = this.calendarService.getDefaultTimezone(ctx, params.timezone);
    const visibleCalendars = await client.listCalendars({ maxResults: 250 });
    const calendarById = new Map(
      (visibleCalendars.items ?? []).map((calendar) => [calendar.id, calendar] as const),
    );
    const roomGroupIds = this.calendarService.getRoomCalendarGroupIds(ctx, params.roomGroupIds);
    const configuredRoomCalendarIds = this.calendarService.getRoomCalendarIds(
      ctx,
      params.roomCalendarIds,
    );
    const directRoomCalendarIds =
      configuredRoomCalendarIds.length > 0 || roomGroupIds.length > 0
        ? configuredRoomCalendarIds
        : inferRoomCalendarIds(visibleCalendars.items ?? []);
    if (directRoomCalendarIds.length === 0 && roomGroupIds.length === 0) {
      return {
        attendeesAvailable: true,
        rooms: [],
        availableRooms: [],
        timezone,
      };
    }

    const attendeeCalendarIds = params.attendeeCalendarIds ?? [];
    const allCalendarIds = uniqueCalendarIds([
      ...attendeeCalendarIds,
      ...directRoomCalendarIds,
      ...roomGroupIds,
    ]);
    const response = await client.getFreeBusy({
      timeMin: params.timeRange.start,
      timeMax: params.timeRange.end,
      timeZone: timezone,
      calendarIds: allCalendarIds,
      groupExpansionMax: 100,
      calendarExpansionMax: 50,
    });
    const roomCalendarIds = uniqueCalendarIds([
      ...directRoomCalendarIds,
      ...expandGroupCalendarIds(response.groups, roomGroupIds),
    ]);

    const attendeesAvailable = attendeeCalendarIds.every(
      (calendarId) => (response.calendars?.[calendarId]?.busy ?? []).length === 0,
    );
    const rooms = roomCalendarIds.map((calendarId): RoomAvailability => {
      const busy = response.calendars?.[calendarId]?.busy ?? [];
      const roomAvailable = busy.length === 0;
      const calendar = calendarById.get(calendarId);
      return {
        calendarId,
        name: calendar?.summary ?? calendarId,
        timezone: calendar?.timeZone,
        roomAvailable,
        available: roomAvailable && attendeesAvailable,
        busy,
      };
    });
    const visibleRooms = params.includeUnavailable ? rooms : rooms.filter((room) => room.available);

    return {
      attendeesAvailable,
      rooms: visibleRooms,
      availableRooms: rooms.filter((room) => room.available),
      timezone,
    };
  }

  @Func({
    name: "calendar.createEvent",
    description: "Create a calendar event.",
  })
  @InputSchema(CreateEventInputSchema)
  @OutputSchema(CreateEventOutputSchema)
  async createEvent(@Ctx() ctx: Context, @Input() params: CreateEventInput) {
    const client = this.calendarService.createClient(ctx);
    const calendarId = this.calendarService.getDefaultCalendarId(ctx, params.calendarId);
    const timezone = this.calendarService.getDefaultTimezone(ctx, params.timezone);
    const event = await client.createEvent(
      calendarId,
      buildGoogleEventBody(params, timezone),
      buildEventWriteOptions(params),
    );

    return { event: mapGoogleEvent(calendarId, event) };
  }

  @Func({
    name: "calendar.updateEvent",
    description: "Update a calendar event.",
  })
  @InputSchema(UpdateEventInputSchema)
  @OutputSchema(UpdateEventOutputSchema)
  async updateEvent(@Ctx() ctx: Context, @Input() params: UpdateEventInput) {
    const client = this.calendarService.createClient(ctx);
    const calendarId = this.calendarService.getDefaultCalendarId(ctx, params.calendarId);
    const timezone = this.calendarService.getDefaultTimezone(ctx, params.timezone);
    const event = await client.updateEvent(
      calendarId,
      params.eventId,
      buildGoogleEventPatch(params, timezone),
      buildEventWriteOptions(params),
    );

    return { event: mapGoogleEvent(calendarId, event) };
  }

  private async listChoiceCalendars(
    ctx: Context,
    params: CalendarChoicesInput,
  ): Promise<GoogleCalendarListEntry[]> {
    const response = await this.calendarService.createClient(ctx).listCalendars({
      maxResults: 250,
      showHidden: params.includeHidden,
      showDeleted: params.includeDeleted,
    });

    return (response.items ?? []).filter((calendar) => {
      if (!params.includeHidden && calendar.hidden) {
        return false;
      }
      if (!params.includeDeleted && calendar.deleted) {
        return false;
      }
      return true;
    });
  }
}

function mapCalendarSummary(
  calendar: GoogleCalendarListEntry,
): z.infer<typeof CalendarSummarySchema> {
  return {
    id: calendar.id,
    name: calendar.summary ?? calendar.id,
    timezone: calendar.timeZone,
    isPrimary: calendar.primary,
    accessRole: calendar.accessRole,
  };
}

function mapCalendarChoice(calendar: GoogleCalendarListEntry): ConfigChoice {
  const metadata = [calendar.id, calendar.timeZone, calendar.accessRole]
    .filter(Boolean)
    .join(" | ");
  return {
    label: calendar.summary ?? calendar.id,
    value: calendar.id,
    description: metadata || undefined,
  };
}

function withPrimaryAlias(choices: ConfigChoice[]): ConfigChoice[] {
  return [
    {
      label: "기본 캘린더",
      value: "primary",
      description: "연동된 계정의 Google Calendar primary alias입니다.",
    },
    ...choices,
  ];
}

function mapFreeBusyCalendars(
  calendarIds: string[],
  calendars:
    | Record<
        string,
        {
          busy?: Array<{ start: string; end: string }>;
          errors?: Array<{ domain?: string; reason?: string }>;
        }
      >
    | undefined,
): Array<z.infer<typeof CalendarFreeBusySchema>> {
  return calendarIds.map((calendarId) => ({
    calendarId,
    busy: calendars?.[calendarId]?.busy ?? [],
    errors: calendars?.[calendarId]?.errors,
  }));
}

function buildGoogleEventBody(params: CreateEventInput, timezone: string): Record<string, unknown> {
  return removeUndefined({
    summary: params.summary,
    description: params.description,
    location: params.location,
    start: {
      dateTime: params.startTime,
      timeZone: timezone,
    },
    end: {
      dateTime: params.endTime,
      timeZone: timezone,
    },
    attendees: buildEventAttendees(params.attendees, params.roomCalendarIds),
    conferenceData: params.createMeetLink
      ? {
          createRequest: {
            requestId: `channel-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        }
      : undefined,
  });
}

function buildGoogleEventPatch(
  params: UpdateEventInput,
  timezone: string,
): Record<string, unknown> {
  return removeUndefined({
    summary: params.summary,
    description: params.description,
    location: params.location,
    start: params.startTime
      ? {
          dateTime: params.startTime,
          timeZone: timezone,
        }
      : undefined,
    end: params.endTime
      ? {
          dateTime: params.endTime,
          timeZone: timezone,
        }
      : undefined,
    attendees:
      params.attendees !== undefined || params.roomCalendarIds !== undefined
        ? buildEventAttendees(params.attendees, params.roomCalendarIds)
        : undefined,
    conferenceData: params.createMeetLink
      ? {
          createRequest: {
            requestId: `channel-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        }
      : undefined,
  });
}

function buildEventAttendees(
  attendees: Array<z.infer<typeof EventAttendeeInputSchema>> | undefined,
  roomCalendarIds: string[] | undefined,
): Array<Record<string, unknown>> | undefined {
  const people =
    attendees?.map((attendee) => ({
      email: attendee.email,
      displayName: attendee.name,
      optional: attendee.optional,
    })) ?? [];
  const rooms =
    roomCalendarIds?.map((roomCalendarId) => ({
      email: roomCalendarId,
      resource: true,
    })) ?? [];
  const allAttendees = [...people, ...rooms];
  return allAttendees.length > 0 ? allAttendees : undefined;
}

function buildEventWriteOptions(
  params: Pick<CreateEventInput | UpdateEventInput, "sendUpdates" | "createMeetLink">,
) {
  const options: {
    sendUpdates?: "all" | "externalOnly" | "none";
    conferenceDataVersion?: 0 | 1;
  } = {};
  if (params.sendUpdates !== undefined) {
    options.sendUpdates = params.sendUpdates;
  }
  if (params.createMeetLink) {
    options.conferenceDataVersion = 1;
  }
  return options;
}

function mapGoogleEvent(
  calendarId: string,
  event: GoogleEvent,
): z.infer<typeof CalendarEventSchema> {
  return {
    id: event.id,
    calendarId,
    htmlLink: event.htmlLink,
    summary: event.summary,
    description: event.description,
    location: event.location,
    status: event.status,
    start: event.start,
    end: event.end,
    attendees: event.attendees?.map((attendee) => ({
      email: attendee.email,
      name: attendee.displayName,
      optional: attendee.optional,
      resource: attendee.resource,
      responseStatus: attendee.responseStatus,
    })),
    meetingUrl: getMeetingUrl(event),
    created: event.created,
    updated: event.updated,
  };
}

function mapDirectoryMember(person: GoogleDirectoryPerson): z.infer<typeof DirectoryMemberSchema> {
  const primaryName = pickPrimary(person.names);
  const primaryEmail = pickPrimary(person.emailAddresses);
  const primaryPhoto = pickPrimary(person.photos);
  const primaryOrganization = pickPrimary(person.organizations);

  return {
    resourceName: person.resourceName,
    displayName: primaryName?.displayName,
    givenName: primaryName?.givenName,
    familyName: primaryName?.familyName,
    email: primaryEmail?.value,
    calendarId: primaryEmail?.value,
    photoUrl: primaryPhoto?.url,
    organization: primaryOrganization?.name,
    department: primaryOrganization?.department,
    title: primaryOrganization?.title,
    deleted: person.metadata?.deleted,
  };
}

function pickPrimary<T extends { metadata?: { primary?: boolean } }>(
  values: T[] | undefined,
): T | undefined {
  return values?.find((value) => value.metadata?.primary) ?? values?.[0];
}

function inferRoomCalendarIds(calendars: GoogleCalendarListEntry[]): string[] {
  return calendars.filter(isLikelyRoomCalendar).map((calendar) => calendar.id);
}

function uniqueCalendarIds(calendarIds: string[]): string[] {
  return [...new Set(calendarIds)];
}

function expandGroupCalendarIds(
  groups:
    | Record<
        string,
        {
          calendars?: string[];
          errors?: Array<{ domain?: string; reason?: string }>;
        }
      >
    | undefined,
  groupIds: string[],
): string[] {
  return groupIds.flatMap((groupId) => groups?.[groupId]?.calendars ?? []);
}

function isLikelyRoomCalendar(calendar: GoogleCalendarListEntry): boolean {
  const haystack = `${calendar.id} ${calendar.summary ?? ""}`.toLowerCase();
  return (
    haystack.includes("room") ||
    haystack.includes("회의실") ||
    haystack.includes("meeting room") ||
    haystack.includes("conference")
  );
}

function getMeetingUrl(event: GoogleEvent): string | undefined {
  return (
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find((entryPoint) => entryPoint.entryPointType === "video")
      ?.uri
  );
}

function expandBusyIntervals(busy: BusyInterval[], bufferMinutes: number): BusyInterval[] {
  if (bufferMinutes <= 0) {
    return busy;
  }

  const bufferMs = bufferMinutes * 60 * 1000;
  return busy.map((interval) => ({
    start: new Date(Date.parse(interval.start) - bufferMs).toISOString(),
    end: new Date(Date.parse(interval.end) + bufferMs).toISOString(),
  }));
}

function removeUndefined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}
