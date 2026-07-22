# WAM

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

この React frontend は WAM bridge に
[`@channel.io/app-sdk-wam`](https://github.com/channel-io/app-sdk/tree/main/ts/packages/wam)、
WAM 専用 theme、navigation、state、高さ同期に
[`@channel.io/app-sdk-wam-ui`](https://github.com/channel-io/app-sdk/tree/main/ts/packages/wam-ui)
を使います。一般的な UI component は `@channel.io/bezier-react/beta` から直接 import します。

`../contracts/tutorial-wam-data.schema.json` は Go server と WAM 間の public wire contract です。
Go parity test が field と Function name を確認し、`src/contracts.ts` が Function call を
有効にする前に host data を validation します。Channel API access token と server-only runtime
type は共有しません。

Example は Bezier React `4.0.0-next.13` と Bezier Icons `0.60.0` を固定します。Bezier React 4
はまだ prerelease なので version を明示的に pin し、upgrade 前に
[SDK WAM UI guide](https://github.com/channel-io/app-sdk/blob/main/docs/reference/typescript/WAM-UI.md)
を確認してください。

## Development

```sh
corepack yarn install --immutable
corepack yarn dev
```

WAM を build して typecheck します。

```sh
corepack yarn build
corepack yarn typecheck
```

Build output は `dist/` に生成され、Go tutorial server が
`/resource/wam/tutorial` で配信します。
