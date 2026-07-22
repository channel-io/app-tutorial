# WAM

This React frontend uses
[`@channel.io/app-sdk-wam`](https://github.com/channel-io/cht-app-sdk/tree/main/ts/packages/wam)
for the WAM bridge and
[`@channel.io/app-sdk-wam-ui`](https://github.com/channel-io/cht-app-sdk/tree/main/ts/packages/wam-ui)
for WAM-specific theming, navigation, states, and content-height synchronization. Import
general-purpose UI components directly from `@channel.io/bezier-react/beta`.

The language-neutral schema in `../contracts/tutorial-wam-data.schema.json` is the public wire
contract between the Go server and this WAM. Go parity tests verify its field and function names,
while `src/contracts.ts` validates host data before enabling function calls. Secrets, tokens used
to access Channel APIs, and server-only runtime types are not shared.

The example pins Bezier React `4.0.0-next.13` and Bezier Icons `0.60.0`. Bezier React 4 is still a
prerelease, so keep the selected version explicit and check the
[SDK WAM UI guide](https://github.com/channel-io/cht-app-sdk/blob/main/docs/reference/typescript/WAM-UI.md)
before upgrading it.

## Development

Install dependencies and run the development server:

```sh
corepack yarn install --immutable
corepack yarn dev
```

Build and type-check the WAM:

```sh
corepack yarn build
corepack yarn typecheck
```

The WAM output is written to `dist/`. The Go tutorial server exposes that directory below
`/resource/wam/tutorial`.
