# Channel App tutorial — Go

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

A minimal Channel App Store app built with the official
[Channel App SDK](https://github.com/channel-io/app-sdk). The tutorial uses the SDK for the
function registry, schemas, command extension, versioned HTTP route, extension auto-registration,
token lifecycle, and request-signature verification.

Use this repository for a runnable end-to-end app. Use the SDK repository for the API contract and
design guidance:

- [English app-development guide](https://github.com/channel-io/app-sdk/blob/main/docs/guides/en/app-development.md)
- [English concepts: Function, Extension, WAM, and authentication](https://github.com/channel-io/app-sdk/blob/main/docs/guides/en/concepts.md)
- [English Extension guide](https://github.com/channel-io/app-sdk/blob/main/docs/guides/en/extensions.md)
- [한국어 앱 개발 전체 가이드](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/app-development.md)
- [한국어 핵심 개념](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/concepts.md)
- [한국어 Extension 전체 가이드](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/extensions.md)
- [日本語アプリ開発完全ガイド](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/app-development.md)
- [日本語の基本概念](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/concepts.md)
- [日本語 Extension 完全ガイド](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/extensions.md)
- [Go feature parity](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go-feature-parity.md)
- [Go SDK reference](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/README.md)
- [Go authentication and tokens](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/AUTH-AND-TOKENS.md)
- [WAM SDK](https://github.com/channel-io/app-sdk/blob/main/docs/reference/typescript/WAM.md)

## What this app demonstrates

- `github.com/channel-io/app-sdk/go` `v0.14.0`
- a `command` extension registered through the SDK builder
- typed app functions and generated JSON schemas
- SDK-managed app/channel token caching and refresh
- the SDK Gin server at `/functions/:version`
- a React WAM using `@channel.io/app-sdk-wam` `0.17.2`
- a language-neutral JSON Schema checked against both Go DTOs and TypeScript WAM data
- redesigned Bezier components from `@channel.io/bezier-react/beta`

Run the `/tutorial` desk command in a group chat to open a WAM. The WAM can send a team-chat message
either through the app bot or as the current manager. Other chat types show an explicit unsupported
message instead of silently closing.

Concepts in this repository map to concrete code as follows:

- **Extension**: the command builder publishes command metadata as the versioned `command` capability.
- **Function**: `tutorial.open` and `tutorial.sendAsBot` are standalone typed operations referenced by the command and WAM.
- **WAM**: the React UI is served at `/resource/wam/tutorial`; `useCallFunction` calls the app server and `useNativeFunction` acts as the current manager.
- **Authentication**: the SDK server verifies inbound signatures, `native.TokenManager` caches the channel token used by the bot path, the server signs the allowed group-chat target before giving it to the WAM, and the Channel host owns manager authorization.

The Go SDK currently owns the token lifecycle but does not yet expose a typed proxy wrapper for
`writeGroupMessage`. `internal/tutorial/native_message.go` is therefore a deliberately small
transport adapter for that one native function; the rest of the old hand-written AppStore client,
token repository, command registrar, and function router has been removed.

## SDK contract alignment

This tutorial follows the public SDK runtime contract:

- SDK-owned typed function and extension discovery
- `PUT /functions/:version` (`/functions/v1` here)
- signature verification and SDK token lifecycle
- AppStore extension registration after deployment
- a narrow ingress compatibility route from bare `PUT /functions` calls to the same verified SDK
  handler when the caller does not carry a system version

This app pins the latest Go SDK release and exposes the Function and WAM endpoint roots directly.

## Prerequisites

- Go 1.25
- Node.js and Yarn 4 through Corepack (for the WAM)
- a private Channel App with an App ID, App Secret, and Signing Key

If you do not have an app yet, follow the SDK's
[private-app preparation sequence](https://github.com/channel-io/app-sdk/blob/main/docs/guides/en/app-development.md#prepare-a-private-app-before-coding): create a development app, keep credentials server-side, enable the minimum permissions below, prepare endpoint roots, and install it in a test channel.

Enable these permissions in the app's **Authentication and permissions** settings:

- Channel: `writeGroupMessage`
- Manager: `writeGroupMessageAsManager`

## Configure

```sh
cp .env.example .env
```

Fill in `APP_ID`, `APP_SECRET`, and the hex-encoded `SIGNING_KEY`, then load the file into your shell:

```sh
set -a
. ./.env
set +a
```

Keep secrets out of Git.

## Prepare HTTPS endpoints

Start or reserve an HTTPS tunnel to local port `3022`, then save these roots in the developer portal
before starting the auto-registering server:

- Function Endpoint: `https://YOUR_HOST/functions`
- WAM Endpoint: `https://YOUR_HOST/resource/wam`

Do not append `/v1` or `/tutorial`. If credentials, permissions, or endpoints change after the
server starts, restart the server so auto-registration runs again.

The SDK route itself remains versioned. The tutorial also accepts bare `PUT /functions` through the
same verified SDK handler because current command execution can call the configured Function
Endpoint without a system-version suffix. Both paths reuse the same signature verification.

## Build and run

```sh
make build
make run
```

Or run the verified test suite separately:

```sh
make test
```

The defaults expose:

| Setting           | URL                                           |
| ----------------- | --------------------------------------------- |
| Function Endpoint | `https://YOUR_HOST/functions`                 |
| WAM Endpoint      | `https://YOUR_HOST/resource/wam`              |
| Health check      | `http://localhost:3022/ping`                  |
| Local WAM         | `http://localhost:3022/resource/wam/tutorial` |

After the server reports successful startup and extension registration, install or refresh the
private app in the test channel and run `/tutorial` in a group chat. Verify both sender buttons and
a permission-failure case. Do not set `SKIP_SIGNATURE_VERIFICATION=true` outside local debugging.

## Project map

```text
cmd/main.go                         SDK server and extension auto-registration
cmd/function_endpoint.go            bare Function Endpoint compatibility route
internal/tutorial/app.go           command metadata and typed app functions
internal/tutorial/contracts.go     Go types and names for the public WAM contract
internal/tutorial/native_message.go one native transport adapter
contracts/                         language-neutral WAM wire schema
wam/src/contracts.ts               TypeScript view and runtime validation of that schema
wam/src/pages/Send/Send.tsx         WAM SDK hooks for app/native calls
```

When this tutorial and older web documentation disagree, follow the SDK's public exports, SDK
reference, SDK guides, and this runnable example in that order. The SDK guide links back to this
tutorial and calls out the one native transport gap explicitly.
