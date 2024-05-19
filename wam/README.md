# WAM

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

Build results will be in `/resource/wam`.
