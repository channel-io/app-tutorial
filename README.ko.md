# Channel App 튜토리얼 — Go

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

공식 [Channel App SDK](https://github.com/channel-io/app-sdk)로 만든 최소 end-to-end App Store
앱입니다. SDK가 Function registry, schema, command Extension, versioned HTTP route,
auto-registration, token lifecycle, request signature 검증을 담당합니다.

이 저장소는 바로 실행할 수 있는 예제로 사용하고 계약과 설계 원칙은 SDK 문서를 확인하세요.

- [앱 개발 전체 가이드](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/app-development.md)
- [Function, Extension, WAM, 인증 핵심 개념](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/concepts.md)
- [Extension 전체 가이드](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/extensions.md)
- [Go SDK 레퍼런스](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/README.md)
- [Go 인증과 token](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go/AUTH-AND-TOKENS.md)
- [Go 기능 동등성](https://github.com/channel-io/app-sdk/blob/main/docs/reference/go-feature-parity.md)
- [WAM SDK](https://github.com/channel-io/app-sdk/blob/main/docs/reference/typescript/WAM.md)

## 이 앱에서 확인할 수 있는 것

- `github.com/channel-io/app-sdk/go` `v0.14.0`
- SDK builder로 등록하는 `command` Extension
- Typed app Function과 생성되는 JSON Schema
- SDK가 관리하는 app/channel token cache와 refresh
- `/functions/:version`의 SDK Gin server
- `@channel.io/app-sdk-wam` `0.17.2`를 사용하는 React WAM
- Go DTO와 TypeScript WAM data가 함께 검증하는 언어 중립 JSON Schema
- `@channel.io/bezier-react/beta`의 Bezier 4 component

그룹 대화에서 `/tutorial` Desk command를 실행하면 WAM이 열립니다. WAM은 app bot 또는 현재
manager 권한으로 team-chat message를 보냅니다. 지원하지 않는 chat type에서는 조용히 닫지 않고
오류 상태를 보여 줍니다.

코드에서 핵심 개념은 다음과 대응합니다.

- **Extension**: command builder가 versioned `command` capability metadata를 공개합니다.
- **Function**: `tutorial.open`과 `tutorial.sendAsBot`은 command와 WAM이 참조하는 standalone typed operation입니다.
- **WAM**: React UI는 `/resource/wam/tutorial`에서 제공됩니다. `useCallFunction`은 app server를, `useNativeFunction`은 현재 manager 주체로 Channel을 호출합니다.
- **인증**: SDK server가 inbound signature를 검증하고 `native.TokenManager`가 bot 경로의 channel token을 cache합니다. Server는 허용된 group-chat target에 짧은 signature를 붙여 WAM에 전달하며 manager authorization은 Channel host가 관리합니다.

Go SDK는 token lifecycle을 관리하지만 아직 `writeGroupMessage` typed proxy wrapper를 제공하지
않습니다. `internal/tutorial/native_message.go`는 이 native Function 하나만 격리한 transport
adapter입니다. 나머지 token repository, command registrar, Function router는 SDK가 담당합니다.

## SDK 계약

이 튜토리얼은 공개 SDK runtime 계약을 따릅니다.

- SDK가 소유하는 typed Function/Extension discovery
- `PUT /functions/:version`과 `/functions/v1`
- Signature 검증과 SDK token lifecycle
- Deploy 이후 AppStore Extension 등록
- System version이 없는 bare `PUT /functions`를 같은 검증된 SDK handler로 연결하는 좁은 compatibility route

앱은 최신 Go SDK release를 고정하고 Function/WAM endpoint root를 직접 제공합니다.

## 준비 사항

- Go 1.25
- WAM용 Node.js와 Corepack 기반 Yarn 4
- App ID, App Secret, Signing Key가 있는 개발용 private Channel App

앱이 아직 없다면 SDK의
[private app 준비 순서](https://github.com/channel-io/app-sdk/blob/main/docs/guides/ko/app-development.md#구현-전에-private-app-준비하기)에
따라 앱 생성, server-side credential 보관, 최소 permission, endpoint root, test channel 설치를
먼저 완료하세요.

**인증 및 권한** 설정에서 다음 permission을 활성화합니다.

- Channel: `writeGroupMessage`
- Manager: `writeGroupMessageAsManager`

## 환경 변수

```sh
cp .env.example .env
```

`APP_ID`, `APP_SECRET`, hex-encoded `SIGNING_KEY`를 입력하고 현재 shell에 불러옵니다.

```sh
set -a
. ./.env
set +a
```

Secret을 Git에 commit하지 마세요.

## HTTPS endpoint

Local port `3022`를 연결하는 HTTPS tunnel을 준비하고 개발자 포털에 다음 root를 저장합니다.

- Function Endpoint: `https://YOUR_HOST/functions`
- WAM Endpoint: `https://YOUR_HOST/resource/wam`

`/v1`이나 `/tutorial`을 덧붙이지 않습니다. Credential, permission, endpoint를 server 시작 뒤
바꿨다면 auto-registration이 다시 실행되도록 server를 재시작하세요.

SDK route는 versioned path를 사용합니다. 현재 command execution은 system version 없이 설정된
Function Endpoint를 호출할 수 있으므로 튜토리얼은 bare `PUT /functions`도 같은 SDK handler와
signature 검증으로 연결합니다.

## Build와 실행

```sh
make build
make run
```

검증된 test suite만 따로 실행할 수 있습니다.

```sh
make test
```

| 설정              | URL                                           |
| ----------------- | --------------------------------------------- |
| Function Endpoint | `https://YOUR_HOST/functions`                 |
| WAM Endpoint      | `https://YOUR_HOST/resource/wam`              |
| Health check      | `http://localhost:3022/ping`                  |
| Local WAM         | `http://localhost:3022/resource/wam/tutorial` |

Server가 시작되고 Extension 등록이 성공하면 test channel에서 private app을 설치하거나 새로고침한
뒤 그룹 대화에서 `/tutorial`을 실행하세요. 두 sender button과 permission failure를 모두
확인합니다. `SKIP_SIGNATURE_VERIFICATION=true`는 local debugging 밖에서 사용하지 마세요.

## 프로젝트 구조

```text
cmd/main.go                         SDK server와 Extension auto-registration
cmd/function_endpoint.go            bare Function Endpoint compatibility route
internal/tutorial/app.go           command metadata와 typed app Function
internal/tutorial/contracts.go     public WAM contract의 Go type과 name
internal/tutorial/native_message.go 하나의 native transport adapter
contracts/                         언어 중립 WAM wire schema
wam/src/contracts.ts               TypeScript view와 runtime validation
wam/src/pages/Send/Send.tsx         app/native call용 WAM SDK hook
```

이 튜토리얼과 오래된 웹 문서가 다르면 공개 SDK export, SDK reference, SDK guide, 이 실행 예제
순서로 확인하세요. Go native transport gap은 SDK의 기능 동등성 문서에서 명시합니다.
