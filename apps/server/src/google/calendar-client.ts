import type {
  GoogleCalendarApiErrorBody,
  GoogleCalendarListResponse,
  GoogleEvent,
  GoogleEventsResponse,
  GoogleFreeBusyResponse,
} from "./types.js";

const GOOGLE_CALENDAR_API_BASE_URL = "https://www.googleapis.com/calendar/v3";

type QueryValue = string | number | boolean | undefined;

export interface ListCalendarsParams {
  pageToken?: string | undefined;
  maxResults?: number | undefined;
  minAccessRole?: "freeBusyReader" | "reader" | "writer" | "owner" | undefined;
  showDeleted?: boolean | undefined;
  showHidden?: boolean | undefined;
}

export interface ListEventsParams {
  timeMin?: string | undefined;
  timeMax?: string | undefined;
  maxResults?: number | undefined;
  pageToken?: string | undefined;
  q?: string | undefined;
  singleEvents?: boolean | undefined;
  orderBy?: "startTime" | "updated" | undefined;
}

export interface FreeBusyParams {
  timeMin: string;
  timeMax: string;
  timeZone?: string;
  calendarIds: string[];
  groupExpansionMax?: number;
  calendarExpansionMax?: number;
}

export interface EventWriteOptions {
  sendUpdates?: "all" | "externalOnly" | "none" | undefined;
  conferenceDataVersion?: 0 | 1 | undefined;
}

export class GoogleCalendarApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "GoogleCalendarApiError";
  }
}

export class GoogleCalendarClient {
  constructor(private readonly accessToken: string) {}

  async listCalendars(params: ListCalendarsParams = {}): Promise<GoogleCalendarListResponse> {
    return this.request<GoogleCalendarListResponse>("GET", "/users/me/calendarList", {
      pageToken: params.pageToken,
      maxResults: params.maxResults,
      minAccessRole: params.minAccessRole,
      showDeleted: params.showDeleted,
      showHidden: params.showHidden,
    });
  }

  async listEvents(
    calendarId: string,
    params: ListEventsParams = {},
  ): Promise<GoogleEventsResponse> {
    return this.request<GoogleEventsResponse>(
      "GET",
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        timeMin: params.timeMin,
        timeMax: params.timeMax,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        q: params.q,
        singleEvents: params.singleEvents ?? true,
        orderBy: params.orderBy ?? "startTime",
      },
    );
  }

  async getEvent(calendarId: string, eventId: string): Promise<GoogleEvent> {
    return this.request<GoogleEvent>(
      "GET",
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    );
  }

  async getFreeBusy(params: FreeBusyParams): Promise<GoogleFreeBusyResponse> {
    const body = {
      timeMin: params.timeMin,
      timeMax: params.timeMax,
      timeZone: params.timeZone,
      groupExpansionMax: params.groupExpansionMax,
      calendarExpansionMax: params.calendarExpansionMax,
      items: params.calendarIds.map((id) => ({ id })),
    };

    return this.request<GoogleFreeBusyResponse>("POST", "/freeBusy", undefined, body);
  }

  async createEvent(
    calendarId: string,
    event: Record<string, unknown>,
    options: EventWriteOptions = {},
  ): Promise<GoogleEvent> {
    return this.request<GoogleEvent>(
      "POST",
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        sendUpdates: options.sendUpdates,
        conferenceDataVersion: options.conferenceDataVersion,
      },
      event,
    );
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    eventPatch: Record<string, unknown>,
    options: EventWriteOptions = {},
  ): Promise<GoogleEvent> {
    return this.request<GoogleEvent>(
      "PATCH",
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        sendUpdates: options.sendUpdates,
        conferenceDataVersion: options.conferenceDataVersion,
      },
      eventPatch,
    );
  }

  async deleteEvent(
    calendarId: string,
    eventId: string,
    options: Pick<EventWriteOptions, "sendUpdates"> = {},
  ): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        sendUpdates: options.sendUpdates,
      },
    );
  }

  private async request<T>(
    method: string,
    path: string,
    query?: Record<string, QueryValue>,
    body?: unknown,
  ): Promise<T> {
    const url = new URL(`${GOOGLE_CALENDAR_API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    };
    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      const responseBody = await readJsonSafely(response);
      throw new GoogleCalendarApiError(
        response.status,
        getErrorMessage(response, responseBody),
        responseBody,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

function getErrorMessage(response: Response, responseBody: unknown): string {
  const body = responseBody as GoogleCalendarApiErrorBody | undefined;
  return body?.error?.message ?? `Google Calendar API request failed with ${response.status}`;
}
