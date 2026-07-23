# Channel App チュートリアル — Go

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

公式 [Channel App SDK](https://github.com/channel-io/app-sdk) で作る最小構成の end-to-end App
Store アプリです。SDK が Function registry、schema、command Extension、versioned HTTP route、
auto-registration、token lifecycle、request signature verification を担当します。

この repository は実行可能な例として使い、contract と設計原則は SDK 文書を参照してください。

- [最初のアプリ Quickstart](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/quickstart.md)
- [アプリ開発完全ガイド](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/app-development.md)
- [Function、Extension、WAM、認証の基本概念](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/concepts.md)
- [Extension 完全ガイド](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/extensions.md)
- [Go SDK reference](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/README.md)
- [Go authentication と token](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/AUTH-AND-TOKENS.md)
- [Go feature parity](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go-feature-parity.md)
- [WAM SDK](https://github.com/channel-io/app-sdk/blob/main/docs/reference/typescript/WAM.md)

## このアプリで確認できること

- `github.com/channel-io/app-sdk/go` `v0.14.0`
- SDK builder で登録する `command` Extension
- Typed app Function と生成される JSON Schema
- SDK-managed app/channel token cache と refresh
- `/functions/:version` の SDK Gin server
- `@channel.io/app-sdk-wam` `0.17.2` を使う React WAM
- Go DTO と TypeScript WAM data を同時に検証する language-neutral JSON Schema
- `@channel.io/bezier-react/beta` の Bezier 4 component

Group chat で `/tutorial` Desk command を実行すると WAM が開きます。WAM は app bot または
現在の manager authorization で team-chat message を送信します。対応しない chat type では
silent close せず error state を表示します。

コード上の基本概念は次の要素に対応します。

- **Extension**: command builder が versioned `command` capability metadata を公開します。
- **Function**: `tutorial.open` と `tutorial.sendAsBot` は command と WAM が参照する standalone typed operation です。
- **WAM**: React UI は `/resource/wam/tutorial` で配信します。`useCallFunction` は app server、`useNativeFunction` は現在の manager として Channel を呼びます。
- **認証**: SDK server が inbound signature を検証し、`native.TokenManager` が bot path の channel token を cache します。Server は許可済み group-chat target に短期 signature を付けて WAM に渡し、manager authorization は Channel host が管理します。

Go SDK は token lifecycle を管理しますが、まだ `writeGroupMessage` typed proxy wrapper を
提供していません。`internal/tutorial/native_message.go` はこの native Function だけを分離した
transport adapter です。その他の token repository、command registrar、Function router は SDK
が担当します。

## SDK contract

この tutorial は public SDK runtime contract に従います。

- SDK-owned typed Function/Extension discovery
- `PUT /functions/:version` と `/functions/v1`
- Signature verification と SDK token lifecycle
- Deploy 後の AppStore Extension registration
- System version がない bare `PUT /functions` を同じ verified SDK handler に接続する限定的な compatibility route

アプリは最新 Go SDK release を pin し、Function/WAM endpoint root を直接公開します。

## 前提条件

- Go 1.25
- WAM 用 Node.js と Corepack 経由の Yarn 4
- App ID、App Secret、Signing Key を持つ開発用 private Channel App

アプリがまだない場合は SDK の
[最初のアプリ Quickstart](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ja/quickstart.md)から
始めてください。Private app creation、server-side credential、minimum permission、endpoint
root、test channel installation を一つの flow で説明します。

**Authentication and permissions** で次の permission を有効にします。

- Channel: `writeGroupMessage`
- Manager: `writeGroupMessageAsManager`

## Clone

```sh
git clone https://github.com/channel-io/app-tutorial.git
cd app-tutorial
corepack enable
```

## 環境変数

```sh
cp .env.example .env
```

`APP_ID`、`APP_SECRET`、hex-encoded `SIGNING_KEY` を入力して現在の shell に読み込みます。

```sh
set -a
. ./.env
set +a
```

Secret を Git に commit しないでください。

## HTTPS endpoint

Local port `3022` に接続する HTTPS tunnel を準備し、developer portal に次の root を保存します。

- Function Endpoint: `https://YOUR_HOST/functions`
- WAM Endpoint: `https://YOUR_HOST/resource/wam`

`/v1` や `/tutorial` を追加しません。Credential、permission、endpoint を server 起動後に
変更した場合は、auto-registration を再実行するため server を restart してください。

SDK route は versioned path を使います。現在の command execution は system version なしで
設定済み Function Endpoint を呼ぶ場合があるため、tutorial は bare `PUT /functions` も同じ
SDK handler と signature verification に接続します。

## Build と実行

```sh
make build
make run
```

検証済み test suite だけを実行できます。

```sh
make test
```

| Setting           | URL                                           |
| ----------------- | --------------------------------------------- |
| Function Endpoint | `https://YOUR_HOST/functions`                 |
| WAM Endpoint      | `https://YOUR_HOST/resource/wam`              |
| Health check      | `http://localhost:3022/ping`                  |
| Local WAM         | `http://localhost:3022/resource/wam/tutorial` |

Server startup と Extension registration が成功したら、test channel で private app を install
または refresh し、group chat で `/tutorial` を実行してください。2 つの sender button と
permission failure を確認します。`SKIP_SIGNATURE_VERIFICATION=true` は local debugging 以外で
使用しないでください。

## Project map

```text
cmd/main.go                         SDK server と Extension auto-registration
cmd/function_endpoint.go            bare Function Endpoint compatibility route
internal/tutorial/app.go           command metadata と typed app Function
internal/tutorial/contracts.go     public WAM contract の Go type と name
internal/tutorial/native_message.go 1 つの native transport adapter
contracts/                         language-neutral WAM wire schema
wam/src/contracts.ts               TypeScript view と runtime validation
wam/src/pages/Send/Send.tsx         app/native call 用 WAM SDK hook
```

現在の contract は SDK guide と reference で確認し、完全な Go server/WAM implementation は
この repository で確認してください。SDK Quickstart もこの tutorial を参照し、Go native
transport gap は feature-parity 文書で明記します。
