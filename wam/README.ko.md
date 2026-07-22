# WAM

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

이 React frontend는 WAM bridge에
[`@channel.io/app-sdk-wam`](https://github.com/channel-io/app-sdk/tree/main/ts/packages/wam)을,
WAM 전용 theme, navigation, 상태 화면, 높이 동기화에
[`@channel.io/app-sdk-wam-ui`](https://github.com/channel-io/app-sdk/tree/main/ts/packages/wam-ui)를
사용합니다. 일반 UI component는 `@channel.io/bezier-react/beta`에서 직접 가져옵니다.

`../contracts/tutorial-wam-data.schema.json`은 Go server와 WAM 사이의 공개 wire contract입니다.
Go parity test가 field와 Function name을 확인하고 `src/contracts.ts`가 Function call을 활성화하기
전에 host data를 검증합니다. Channel API 접근 token과 server-only runtime type은 공유하지 않습니다.

예제는 Bezier React `4.0.0-next.13`과 Bezier Icons `0.60.0`을 고정합니다. Bezier React 4는
아직 prerelease이므로 버전을 명시적으로 고정하고 upgrade 전에
[SDK WAM UI 가이드](https://github.com/channel-io/app-sdk/blob/main/docs/reference/typescript/WAM-UI.md)를
확인하세요.

## 개발

```sh
corepack yarn install --immutable
corepack yarn dev
```

WAM을 build하고 typecheck합니다.

```sh
corepack yarn build
corepack yarn typecheck
```

Build 결과는 `dist/`에 생성되고 Go tutorial server가
`/resource/wam/tutorial`에서 제공합니다.
