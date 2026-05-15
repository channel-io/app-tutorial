export interface GoogleCalendarListEntry {
  id: string;
  summary?: string;
  description?: string;
  timeZone?: string;
  primary?: boolean;
  accessRole?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  deleted?: boolean;
  hidden?: boolean;
}

export interface GoogleCalendarListResponse {
  items?: GoogleCalendarListEntry[];
  nextPageToken?: string;
}

export interface GoogleEventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface GoogleEventAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;
  resource?: boolean;
  responseStatus?: string;
}

export interface GoogleEvent {
  id: string;
  status?: string;
  htmlLink?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleEventDateTime;
  end?: GoogleEventDateTime;
  attendees?: GoogleEventAttendee[];
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
      label?: string;
    }>;
  };
  created?: string;
  updated?: string;
}

export interface GoogleEventsResponse {
  items?: GoogleEvent[];
  nextPageToken?: string;
}

export interface GoogleFreeBusyResponse {
  calendars?: Record<
    string,
    {
      busy?: Array<{ start: string; end: string }>;
      errors?: Array<{ domain?: string; reason?: string }>;
    }
  >;
  groups?: Record<
    string,
    {
      calendars?: string[];
      errors?: Array<{ domain?: string; reason?: string }>;
    }
  >;
  timeMin?: string;
  timeMax?: string;
}

export interface GoogleCalendarApiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    errors?: Array<{
      domain?: string;
      reason?: string;
      message?: string;
    }>;
  };
}
