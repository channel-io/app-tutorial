PROJECT_PATH := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PROJECT_NAME := $(shell basename $(PROJECT_PATH))
TARGET_DIR ?= ${PROJECT_PATH}/target
TARGET_BIN_DIR ?= ${TARGET_DIR}/bin
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)

.PHONY: init build-wam build-go build run dev test clean

init:
	go mod download
	cd ${PROJECT_PATH}/wam && corepack yarn install --immutable

build-wam:
	@echo "Building WAMs..."
	cd ${PROJECT_PATH}/wam && corepack yarn build

build-go:
	mkdir -p ${TARGET_BIN_DIR}
	GOOS=${GOOS} GOARCH=${GOARCH} go build \
		-o ${TARGET_BIN_DIR}/${PROJECT_NAME}.${GOOS}.${GOARCH} ./cmd

build: init build-wam build-go

run:
	${TARGET_BIN_DIR}/${PROJECT_NAME}.${GOOS}.${GOARCH}

dev: build run

test:
	go test ./...

clean:
	rm -rf ${TARGET_DIR} ${PROJECT_PATH}/wam/dist
