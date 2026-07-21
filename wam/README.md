# WAM

This frontend uses [`@channel.io/app-sdk-wam`](https://github.com/channel-io/cht-app-sdk/tree/main/ts/packages/wam) for the WAM bridge and [`@channel.io/app-sdk-wam-ui`](https://github.com/channel-io/cht-app-sdk/tree/main/ts/packages/wam-ui) for Channel-consistent UI patterns. Wrap the app with `WamProvider` and `WamThemeProvider`, then use SDK hooks and components for WAM data, app/native calls, sizing, closing, theming, and content-height synchronization.

The example pins Bezier React `4.0.0-next.13` and Bezier Icons `0.60.0`. Bezier React 4 is still a prerelease, so keep the selected version explicit and check the [SDK WAM UI guide](https://github.com/channel-io/cht-app-sdk/blob/main/docs/reference/typescript/WAM-UI.md) before upgrading it.

## Getting Started

### Install Node and Yarn

Install [`nvm`](https://github.com/nvm-sh/nvm) first, then install node via:

```sh
$ nvm install
$ nvm use
```

Install Yarn via:

```sh
$ corepack enable
$ corepack prepare yarn@stable --activate
```

## Development

Run dev server via:

```sh
$ yarn dev
```

## Build

Build WAM via:

```sh
$ yarn build
```

Build results will be in `dist/`. The tutorial server exposes that directory below `/resource/wam/tutorial`.
