# cht-app-google-calendar

Google Calendar integration app for Channel Talk App Store.

This branch replaces the old Go tutorial app with a TypeScript/Nest server that follows the
same shape as `cht-app-coupang`: the app registers itself through `@channel.io/app-sdk-server`,
uses the OAuth extension for Google credentials, uses the config extension for calendar defaults,
and exposes standalone `calendar.*` functions for channel-level automation.

## OAuth

The OAuth extension returns AppStore SSOT metadata and does not keep Google client credentials in
code. Client ID and Client Secret are managed from Desk/AppStore settings.

Requested Google scopes:

- `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
- `https://www.googleapis.com/auth/calendar.freebusy`
- `https://www.googleapis.com/auth/calendar.events`

The app uses channel-level OAuth. A channel connects one shared Google account, and AppStore injects
that OAuth token into `calendar.*` function calls.

## Config

The config extension stores non-secret runtime settings only:

- default calendar ID
- default timezone
- default event duration
- team calendar IDs, selected from visible calendars or entered manually
- meeting room calendar IDs, selected from visible calendars or entered manually

Calendar and room choices are loaded with the connected OAuth token from calendars visible to that
Google account. This covers calendars the account owns, subscribes to, or has been granted access
to. It does not enumerate every Google Workspace resource calendar in the domain; full room/resource
inventory would require Admin SDK/Directory API permissions and admin setup. Calendar IDs that are
not visible can still be pasted into the additional ID fields.

## Functions

Registered OAuth extension functions:

- `extension.oauth.metadata.getAuthConfig`
- `extension.oauth.validation.validateCredentials`

Registered config extension functions:

- `extension.config.metadata.getConfigSchema`
- `extension.config.validation.validateStoredConfig`

Available app functions:

- `calendar.listCalendars`
- `calendar.listCalendarChoices`
- `calendar.listRoomCalendarChoices`
- `calendar.listEvents`
- `calendar.getFreeBusy`
- `calendar.findAvailableSlots`
- `calendar.findAvailableRooms`
- `calendar.createEvent`
- `calendar.updateEvent`

Meeting rooms can be found with `calendar.findAvailableRooms` when room calendar IDs are configured
or visible in the connected account's calendar list.

## Development

```bash
pnpm install
pnpm dev
```

Required environment:

```bash
APP_ID=...
APP_SECRET=...
APP_STORE_URL=https://app-store-api.channel.io
```

See `.env.example` for optional env fallbacks. App config takes precedence over env fallbacks, and
callers can still pass calendar and room IDs directly through function params.
