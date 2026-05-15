import type { GoogleCalendarApiErrorBody } from "./types.js";

const GOOGLE_PEOPLE_API_BASE_URL = "https://people.googleapis.com/v1";
const DIRECTORY_READ_MASK = "names,emailAddresses,photos,organizations,metadata";
const DOMAIN_PROFILE_SOURCE = "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE";
const DOMAIN_CONTACT_SOURCE = "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT";

type QueryValue = string | number | boolean | string[] | undefined;

export interface GoogleDirectoryPerson {
  resourceName?: string;
  etag?: string;
  metadata?: {
    deleted?: boolean;
  };
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
    metadata?: { primary?: boolean };
  }>;
  emailAddresses?: Array<{
    value?: string;
    type?: string;
    metadata?: { primary?: boolean };
  }>;
  photos?: Array<{
    url?: string;
    default?: boolean;
    metadata?: { primary?: boolean };
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
    metadata?: { primary?: boolean };
  }>;
}

export interface ListDirectoryPeopleParams {
  pageSize?: number | undefined;
  pageToken?: string | undefined;
  includeDomainContacts?: boolean | undefined;
}

export interface SearchDirectoryPeopleParams {
  query: string;
  pageSize?: number | undefined;
  pageToken?: string | undefined;
  includeDomainContacts?: boolean | undefined;
}

export interface ListDirectoryPeopleResponse {
  people?: GoogleDirectoryPerson[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface SearchDirectoryPeopleResponse {
  people?: GoogleDirectoryPerson[];
  nextPageToken?: string;
  totalSize?: number;
}

export class GooglePeopleClient {
  constructor(private readonly accessToken: string) {}

  async listDirectoryPeople(
    params: ListDirectoryPeopleParams = {},
  ): Promise<ListDirectoryPeopleResponse> {
    return this.request<ListDirectoryPeopleResponse>("/people:listDirectoryPeople", {
      readMask: DIRECTORY_READ_MASK,
      sources: buildDirectorySources(params.includeDomainContacts),
      pageSize: params.pageSize,
      pageToken: params.pageToken,
    });
  }

  async searchDirectoryPeople(
    params: SearchDirectoryPeopleParams,
  ): Promise<SearchDirectoryPeopleResponse> {
    return this.request<SearchDirectoryPeopleResponse>("/people:searchDirectoryPeople", {
      query: params.query,
      readMask: DIRECTORY_READ_MASK,
      sources: buildDirectorySources(params.includeDomainContacts),
      pageSize: params.pageSize,
      pageToken: params.pageToken,
    });
  }

  private async request<T>(path: string, query: Record<string, QueryValue>): Promise<T> {
    const url = new URL(`${GOOGLE_PEOPLE_API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const responseBody = await readJsonSafely(response);
      throw new GooglePeopleApiError(
        response.status,
        getErrorMessage(response, responseBody),
        responseBody,
      );
    }

    return (await response.json()) as T;
  }
}

export class GooglePeopleApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "GooglePeopleApiError";
  }
}

function buildDirectorySources(includeDomainContacts: boolean | undefined): string[] {
  return includeDomainContacts
    ? [DOMAIN_PROFILE_SOURCE, DOMAIN_CONTACT_SOURCE]
    : [DOMAIN_PROFILE_SOURCE];
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
  return body?.error?.message ?? `Google People API request failed with ${response.status}`;
}
