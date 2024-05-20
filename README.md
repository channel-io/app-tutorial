# app-tutorial

Hello, world!

This project is a tutorial to develop app-server of Channel Corp. App Store.

Thank you for visiting. 😁

| Index                         |                                                       |
| ----------------------------- | ----------------------------------------------------- |
| [Prerequisite](#prerequisite) | -                                                     |
| [Installation](#installation) | -                                                     |
| [Build](#build)               | # [Build the whole project](#build-the-whole-project) |
|                               | # [Build only the wam](#build-only-wam)               |
| [APIs](#apis)                 | # [ping](#ping)                                       |
|                               | # [functions](#functions)                             |
|                               | # [wam(static)](#wam)                                 |

## Prerequisite

- [go](https://go.dev/) v1.21
- [yarn](https://yarnpkg.com/) v4; Check [here](wam) for wam.

## Installation

It is available to download the necessary packages for the project by running one of the following commands:

1. Use makefile.

```sh
$ make init
```

2. Use go cli.

```sh
$ go mod tidy
```

## Build

### Build the whole project

```sh
$ make build # it builds wam, either.
```

### Build only wam

```sh
$ make build-wam
```

## Run

### Configuration

Before running the program, make sure to check the [configuration](config/development.yml) file.

You must prepare the metadata of the app by registering one to Channel App Store.

```yaml
stage: development # name of the env

appId: # app id registered in advance
appSecret: # app secret issued in advance

api:
  public:
    http:
      port: 3022 # port number of the server

appStore:
  baseUrl: # api endpoint of the Channel App Store

bot:
  name: AppTutorialBot # bot name to write messages in groups
```

### Run the program

```sh
$ STAGE="your stage" make dev
```

The default setting for the stage is `development`.

## APIs

### ping

| METHOD | PATH    |
| ------ | ------- |
| GET    | `/ping` |

#### Request

```json
(empty)
```

#### Response

```text
pong
```

### functions

| METHOD | PATH         |
| ------ | ------------ |
| PUT    | `/functions` |

This api is to request general functions defined in the project.

You must register it as a functionUrl of the app.

Note that `context` in the function request is automatically full by the Channel App Store.

#### Request

1. tutorial (to prepare wam arguments before opening the wam)

```json
{
    "method": "tutorial",
    "context": {
        "channel": {
            "id": "channel id which calls the wam"
        }
    }
}
```

2. sendAsBot

`sendAsBot` is a function to write message as a bot.

You can set the name of the bot with [configuration](config) files.

```json
{
    "method": "sendAsBot",
    "params": {
        "input": {
            "groupId": "group id to write a message"
        }
    },
    "context": {
        "channel": {
            "id": "channel id which calls the wam"
        }
    }
}
```

#### Response

_**Success**_

```
200 OK
```

1. tutorial

```json
{
    "result": {
        "type": "wam",
        "attributes": {
            "appId": "app id",
            "name": "tutorial",
            "wamArgs": {
                "managerId": "4761",
                "message": "This is a test message sent by a manager."
            }
        }
    }
}
```

2. sendAsBot

```json
{
  "result": {
        "type": "string",
        "attributes": {}
  }
}
```

_**Failure**_

```
200 OK
```

```json
{
    "error": {
        "type": "",
        "message": "the reason of the failure"
    }
}
```

Note that both the success and the failure return `200 OK` for each request.

### wam

| METHOD | PATH            |
| ------ | --------------- |
| -      | `/resource/wam` |

This endpoint serves a static page of the wam.

You must register it as a wamUrl of the app.

#### Response

```
The wam written in HTML.
```
