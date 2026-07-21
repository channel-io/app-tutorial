# WAM

This frontend uses [`@channel.io/app-sdk-wam`](https://github.com/channel-io/cht-app-sdk/tree/main/ts/packages/wam). Wrap the app with `WamProvider` and use SDK hooks for WAM data, app/native calls, sizing, and closing.

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
